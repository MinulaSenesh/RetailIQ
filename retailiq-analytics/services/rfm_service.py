# services/rfm_service.py — RFM Customer Segmentation (Optimized + Cached)

import pandas as pd
import numpy as np
from datetime import date, datetime
from sqlalchemy import text
from models.database import SessionLocal, engine
from typing import Dict, Any

# ─── In-memory cache (recalculate every 12 hours) ────────────────────────────
_RFM_CACHE: Dict[str, Any] = {
    "result":      None,
    "computed_at": None,
}

CACHE_HOURS = 12


# ─── Vectorized segment assignment (replaces slow apply() loop) ───────────────
def _assign_segments(df: pd.DataFrame) -> pd.Series:
    r  = df["r_score"]
    f  = df["f_score"]
    m  = df["m_score"]
    fm = (f + m) / 2

    conditions = [
        (r >= 4) & (fm >= 4),
        (r <= 2) & (fm >= 4),
        (r >= 3) & (fm >= 3),
        (r >= 4) & (f <= 2) & (m <= 2),
        (r >= 3) & (fm >= 2),
        (r <= 2) & (fm >= 3),
    ]
    choices = [
        "Champion",
        "Cannot Lose",
        "Loyal",
        "New",
        "Potential Loyal",
        "At Risk",
    ]
    return pd.Series(
        np.select(conditions, choices, default="Lost"),
        index=df.index
    )


# ─── Cache freshness check ────────────────────────────────────────────────────
def _cache_is_fresh() -> bool:
    if _RFM_CACHE["result"] is None or _RFM_CACHE["computed_at"] is None:
        return False
    age_hours = (datetime.now() - _RFM_CACHE["computed_at"]).total_seconds() / 3600
    return age_hours < CACHE_HOURS


# ─── Bulk DB update (1 query instead of N queries) ───────────────────────────
def _bulk_update_customers(df: pd.DataFrame) -> None:
    if df.empty:
        return

    segment_cases = " ".join(
        f"WHEN {int(row.customer_id)} THEN '{row.segment}'"
        for row in df.itertuples()
    )
    score_cases = " ".join(
        f"WHEN {int(row.customer_id)} THEN {round(float(row.rfm_score), 2)}"
        for row in df.itertuples()
    )
    id_list = ", ".join(
        str(int(row.customer_id)) for row in df.itertuples()
    )

    db = SessionLocal()
    try:
        db.execute(text(f"""
            UPDATE customers
            SET
                segment   = CASE customer_id {segment_cases} END,
                rfm_score = CASE customer_id {score_cases} END
            WHERE customer_id IN ({id_list})
        """))
        db.commit()
    finally:
        db.close()


# ─── Main RFM Computation ─────────────────────────────────────────────────────
def compute_rfm(reference_date: date = None, force_refresh: bool = False) -> Dict[str, Any]:
    """
    First call / cache expired : ~1–3s
    Subsequent calls (12 hrs)  : ~5ms (cached)
    """
    if not force_refresh and _cache_is_fresh():
        return _RFM_CACHE["result"]

    ref = pd.Timestamp(reference_date or date.today())

    with engine.connect() as conn:
        df = pd.read_sql(text("""
            SELECT o.customer_id,
                   MAX(o.order_date)   AS last_order_date,
                   COUNT(o.order_id)   AS frequency,
                   SUM(o.total_amount) AS monetary
            FROM orders o
            WHERE o.status != 'Cancelled'
            GROUP BY o.customer_id
        """), conn)

    if df.empty:
        return {"segments": [], "total_customers": 0}

    # Calculate R / F / M
    df["recency"]  = (ref - pd.to_datetime(df["last_order_date"])).dt.days
    df["r_score"]  = pd.qcut(df["recency"].rank(method="first"),   q=5, labels=[5,4,3,2,1]).astype(int)
    df["f_score"]  = pd.qcut(df["frequency"].rank(method="first"), q=5, labels=[1,2,3,4,5]).astype(int)
    df["m_score"]  = pd.qcut(df["monetary"].rank(method="first"),  q=5, labels=[1,2,3,4,5]).astype(int)
    df["rfm_score"] = (df["r_score"] + df["f_score"] + df["m_score"]) / 3

    # FIX: vectorized segment assignment (was slow row-by-row apply)
    df["segment"] = _assign_segments(df)

    # FIX: single bulk upsert (was N separate UPDATE queries)
    _bulk_update_customers(df[["customer_id", "segment", "rfm_score"]])

    # Build result with all 8 segments always present
    all_segments = [
        "Champion", "Loyal", "Potential Loyal", "New",
        "Promising", "At Risk", "Cannot Lose", "Lost"
    ]
    total       = len(df)
    segment_map = df["segment"].value_counts().to_dict()

    segments = [
        {
            "segment":    seg,
            "count":      segment_map.get(seg, 0),
            "percentage": round(segment_map.get(seg, 0) / total * 100, 2),
        }
        for seg in all_segments
    ]

    result = {
        "segments":        segments,
        "total_customers": total,
        "updated_at":      datetime.now().isoformat(),
    }

    _RFM_CACHE["result"]      = result
    _RFM_CACHE["computed_at"] = datetime.now()

    return result


# ─── Pre-warm (called from main.py lifespan) ──────────────────────────────────
def prewarm_rfm():
    try:
        print("[RFM] Pre-warming segmentation...")
        compute_rfm(force_refresh=True)
        print("[RFM] Segmentation ready ✓")
    except Exception as e:
        print(f"[RFM] Pre-warm failed (non-critical): {e}")

