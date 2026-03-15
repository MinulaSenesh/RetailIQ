# services/etl_service.py — Full ETL pipeline for RetailIQ (Optimized)

import pandas as pd
import numpy as np
import json
import chardet
from datetime import datetime
from sqlalchemy import text
from models.database import SessionLocal, engine
from typing import Dict, Any

REQUIRED_COLUMNS = {"order_id", "customer_email", "product_sku", "quantity", "unit_price", "order_date"}
REGION_MAP = {
    "western": "Western Province", "western province": "Western Province",
    "central": "Central Province", "central province": "Central Province",
    "southern": "Southern Province", "southern province": "Southern Province",
    "northern": "Northern Province", "northern province": "Northern Province",
    "eastern": "Eastern Province", "eastern province": "Eastern Province",
    "north western": "North Western Province", "north western province": "North Western Province",
    "north central": "North Central Province", "north central province": "North Central Province",
    "uva": "Uva Province", "uva province": "Uva Province",
    "sabaragamuwa": "Sabaragamuwa Province", "sabaragamuwa province": "Sabaragamuwa Province",
}


# ─── Step 1: File Ingestion ───────────────────────────────────────────────────
def load_file(file_path: str) -> pd.DataFrame:
    with open(file_path, "rb") as f:
        raw = f.read(10000)
        detected = chardet.detect(raw)
        encoding = detected.get("encoding", "utf-8") or "utf-8"

    if file_path.endswith(".xlsx"):
        return pd.read_excel(file_path)
    return pd.read_csv(file_path, encoding=encoding, on_bad_lines="skip")


# ─── Step 2: Schema Validation ────────────────────────────────────────────────
def validate_schema(df: pd.DataFrame) -> Dict[str, Any]:
    cols = set(c.lower().strip() for c in df.columns)
    missing = REQUIRED_COLUMNS - cols
    if missing:
        return {"valid": False, "missing_columns": list(missing)}
    return {"valid": True, "missing_columns": []}


# ─── Step 3: Data Cleaning ────────────────────────────────────────────────────
def clean_data(df: pd.DataFrame) -> tuple[pd.DataFrame, list]:
    errors = []
    df.columns = [c.lower().strip() for c in df.columns]

    for col in df.select_dtypes(include="object").columns:
        df[col] = df[col].astype(str).str.strip()

    df = df.dropna(how="all")

    df["order_date"] = pd.to_datetime(df["order_date"], errors="coerce")
    bad_dates = df["order_date"].isna()
    if bad_dates.any():
        for idx in df[bad_dates].index:
            errors.append({"row": int(idx) + 2, "field": "order_date", "error": "Invalid or unparsable date"})
    df = df[~bad_dates]

    before_dedup = len(df)
    df = df.drop_duplicates(subset=["order_id"])
    dedup_count = before_dedup - len(df)
    if dedup_count > 0:
        errors.append({"row": "multiple", "field": "order_id",
                       "error": f"{dedup_count} duplicate order_ids removed"})

    for col in ["quantity", "unit_price"]:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

    for col in ["region", "payment_method", "shipping_address"]:
        if col in df.columns:
            df[col] = df[col].fillna("Unknown")

    if "region" in df.columns:
        df["region"] = df["region"].str.lower().map(REGION_MAP).fillna(df["region"])

    return df, errors


# ─── Step 4: Business Rule Validation ────────────────────────────────────────
def validate_business_rules(df: pd.DataFrame) -> list:
    errors = []
    for idx in df[df["unit_price"] <= 0].index:
        errors.append({"row": int(idx) + 2, "field": "unit_price", "error": "unit_price must be > 0"})
    for idx in df[df["quantity"] <= 0].index:
        errors.append({"row": int(idx) + 2, "field": "quantity", "error": "quantity must be > 0"})
    for idx in df[df["order_date"] > pd.Timestamp.now()].index:
        errors.append({"row": int(idx) + 2, "field": "order_date", "error": "order_date cannot be in the future"})
    return errors


# ─── Step 5: Load to DB ───────────────────────────────────────────────────────
def load_to_db(df: pd.DataFrame, job_id: int) -> Dict[str, int]:
    if df.empty:
        return {"inserted": 0, "skipped": 0, "errors": []}

    db = SessionLocal()
    inserted = 0
    skipped = 0
    load_errors = []

    try:
        # 1. Bulk upsert all unique customers
        unique_emails = df["customer_email"].dropna().unique().tolist()
        if unique_emails:
            customer_values = ", ".join(
                f"('{str(e).split('@')[0]}', '', '{e}')"
                for e in unique_emails
            )
            db.execute(text(f"""
                INSERT IGNORE INTO customers (first_name, last_name, email)
                VALUES {customer_values}
            """))
            db.flush()

        # 2. Load customer_id map in one query
        placeholders = ", ".join(f"'{e}'" for e in unique_emails)
        customer_rows = db.execute(text(f"""
            SELECT customer_id, email FROM customers
            WHERE email IN ({placeholders})
        """)).fetchall()
        customer_map = {row[1]: row[0] for row in customer_rows}

        # 3. Load product_id + price map in one query
        unique_skus = df["product_sku"].dropna().unique().tolist()
        sku_placeholders = ", ".join(f"'{s}'" for s in unique_skus)
        product_rows = db.execute(text(f"""
            SELECT product_id, sku, unit_price FROM products
            WHERE sku IN ({sku_placeholders})
        """)).fetchall()
        product_map = {row[1]: (row[0], row[2]) for row in product_rows}

        # 4. Build order + order_items rows
        order_rows = []
        order_item_rows = []

        for _, row in df.iterrows():
            email = row.get("customer_email", "")
            sku = row.get("product_sku", "")

            cid = customer_map.get(email)
            pid_price = product_map.get(sku)

            if not cid or not pid_price:
                skipped += 1
                continue

            pid = pid_price[0]
            total = float(row["quantity"]) * float(row["unit_price"])

            order_rows.append({
                "cid": cid,
                "od": row["order_date"],
                "st": row.get("status", "Delivered"),
                "ta": total,
                "da": float(row.get("discount_amount", 0)),
                "sa": row.get("shipping_address", ""),
                "pm": row.get("payment_method", "Unknown"),
                "rg": row.get("region", "Unknown"),
                "pid": pid,
                "qty": int(row["quantity"]),
                "up": float(row["unit_price"]),
            })

        # 5. Insert orders and collect order_items
        for o in order_rows:
            try:
                result = db.execute(text("""
                    INSERT IGNORE INTO orders
                      (customer_id, order_date, status, total_amount,
                       discount_amount, shipping_address, payment_method, region)
                    VALUES (:cid, :od, :st, :ta, :da, :sa, :pm, :rg)
                """), o)
                order_id = result.lastrowid
                if order_id:
                    order_item_rows.append({
                        "oid": order_id,
                        "pid": o["pid"],
                        "qty": o["qty"],
                        "up": o["up"],
                    })
                    inserted += 1
                else:
                    skipped += 1
            except Exception as e:
                load_errors.append({"row": "unknown", "error": str(e)})
                skipped += 1

        # 6. Bulk insert all order_items
        if order_item_rows:
            item_values = ", ".join(
                f"({r['oid']}, {r['pid']}, {r['qty']}, {r['up']})"
                for r in order_item_rows
            )
            db.execute(text(f"""
                INSERT INTO order_items (order_id, product_id, quantity, unit_price)
                VALUES {item_values}
            """))

        db.commit()

    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()

    return {"inserted": inserted, "skipped": skipped, "errors": load_errors}


# ─── Full ETL Runner ──────────────────────────────────────────────────────────
def run_etl(job_id: int, file_path: str) -> Dict[str, Any]:
    db = SessionLocal()
    summary = {
        "job_id": job_id, "status": "FAILED", "total_rows": 0,
        "inserted_rows": 0, "skipped_rows": 0, "error_rows": 0, "errors": [],
    }

    try:
        df = load_file(file_path)
        schema_check = validate_schema(df)

        if not schema_check["valid"]:
            summary["errors"] = [{"error": f"Missing columns: {schema_check['missing_columns']}"}]
            db.execute(text("""
                UPDATE upload_history
                SET status='FAILED', error_details=:e, completed_at=NOW()
                WHERE id=:id
            """), {"e": json.dumps(summary["errors"]), "id": job_id})
            db.commit()
            return summary

        df, clean_errors = clean_data(df)
        rule_errors = validate_business_rules(df)
        all_errors = clean_errors + rule_errors
        total = len(df) + len(all_errors)
        load_result = load_to_db(df, job_id)

        summary.update({
            "status": "COMPLETE",
            "total_rows": total,
            "inserted_rows": load_result["inserted"],
            "skipped_rows": load_result["skipped"],
            "error_rows": len(all_errors),
            "errors": all_errors + load_result.get("errors", []),
        })

        db.execute(text("""
            UPDATE upload_history
            SET status=:st, total_rows=:tr, inserted_rows=:ir,
                skipped_rows=:sr, error_rows=:er,
                error_details=:ed, completed_at=NOW()
            WHERE id=:id
        """), {
            "st": "COMPLETE", "tr": total,
            "ir": load_result["inserted"], "sr": load_result["skipped"],
            "er": len(all_errors),
            "ed": json.dumps(all_errors[:50]),
            "id": job_id,
        })
        db.commit()

    except Exception as e:
        summary["errors"] = [{"error": str(e)}]
        try:
            db.execute(text("""
                UPDATE upload_history
                SET status='FAILED', error_details=:e, completed_at=NOW()
                WHERE id=:id
            """), {"e": str(e), "id": job_id})
            db.commit()
        except Exception:
            db.rollback()
    finally:
        db.close()

    return summary