# services/forecast_service.py — Industry-Level Sales Forecasting (Optimized)

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from sqlalchemy import text
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from models.database import engine
from typing import Dict, Any
import threading

# ─── In-memory cache ──────────────────────────────────────────────────────────
_CACHE: Dict[str, Any] = {}
_CACHE_LOCK = threading.Lock()
CACHE_MINUTES = 60


def _cache_is_fresh(key: str) -> bool:
    with _CACHE_LOCK:
        if key not in _CACHE:
            return False
        age = (datetime.now() - _CACHE[key]["computed_at"]).total_seconds() / 60
        return age < CACHE_MINUTES


def _get_cached(key: str):
    with _CACHE_LOCK:
        return _CACHE.get(key, {}).get("data")


def _set_cache(key: str, data: Any):
    with _CACHE_LOCK:
        _CACHE[key] = {"data": data, "computed_at": datetime.now()}


# ─── Core DB fetch (last 365 days only for speed) ────────────────────────────
def _fetch_sales_data() -> pd.DataFrame:
    with engine.connect() as conn:
        df = pd.read_sql(text("""
            SELECT DATE(order_date) AS order_date,
                   SUM(total_amount) AS revenue
            FROM orders
            WHERE status != 'Cancelled'
              AND order_date >= DATE_SUB(NOW(), INTERVAL 365 DAY)
            GROUP BY DATE(order_date)
            ORDER BY order_date
        """), conn)
    return df


# ─── Core ML training ────────────────────────────────────────────────────────
def _train_and_predict(df: pd.DataFrame, days: int) -> Dict[str, Any]:
    from sklearn.ensemble import RandomForestRegressor

    df["order_date"] = pd.to_datetime(df["order_date"])
    df = df.sort_values("order_date").reset_index(drop=True)
    df["day_index"]   = (df["order_date"] - df["order_date"].min()).dt.days
    df["day_of_week"] = df["order_date"].dt.dayofweek          # 0=Mon … 6=Sun
    df["month"]       = df["order_date"].dt.month
    df["rolling_7d"]  = df["revenue"].rolling(7, min_periods=1).mean()
    df["lag_7"]       = df["revenue"].shift(7).bfill()
    df["lag_14"]      = df["revenue"].shift(14).bfill()

    features = ["day_index", "day_of_week", "month", "rolling_7d", "lag_7", "lag_14"]
    X = df[features].values
    y = df["revenue"].values

    model = RandomForestRegressor(n_estimators=200, random_state=42, n_jobs=-1)
    model.fit(X, y)

    y_pred_train = model.predict(X)
    mae  = float(mean_absolute_error(y, y_pred_train))
    rmse = float(np.sqrt(mean_squared_error(y, y_pred_train)))
    r2   = float(r2_score(y, y_pred_train))
    std  = float(np.std(y - y_pred_train))

    last_day   = int(df["day_index"].max())
    last_date  = df["order_date"].max()
    rev_series = df["revenue"].values.tolist()  # rolling window for future preds

    predictions = []
    rolling_window = list(rev_series[-7:])  # last 7 actuals for rolling avg

    for i in range(1, days + 1):
        future_date = last_date + timedelta(days=i)
        future_day  = last_day + i
        dow         = future_date.dayofweek
        month       = future_date.month
        roll7       = float(np.mean(rolling_window[-7:]))
        lag7        = rev_series[-7]  if len(rev_series) >= 7  else roll7
        lag14       = rev_series[-14] if len(rev_series) >= 14 else roll7

        feat = np.array([[future_day, dow, month, roll7, lag7, lag14]])
        pred = float(max(0.0, model.predict(feat)[0]))

        predictions.append({
            "date":        future_date.strftime("%Y-%m-%d"),
            "predicted":   round(pred, 2),
            "lower_bound": round(float(max(0, pred - 1.96 * std)), 2),
            "upper_bound": round(float(pred + 1.96 * std), 2),
            "revenue":     round(pred, 2),
        })

        # slide the rolling window forward with the new prediction
        rolling_window.append(pred)
        rev_series.append(pred)

    return {
        "predictions":     predictions,
        "mae":             round(mae, 2),
        "rmse":            round(rmse, 2),
        "r2":              round(r2, 4),
        "days_forecasted": days,
        "model":           "RandomForest",
    }



# ─── Background cache refresher ──────────────────────────────────────────────
def _refresh_cache_background():
    try:
        df = _fetch_sales_data()
        if df.empty or len(df) < 30:
            return
        for days in [30, 90]:
            result = _train_and_predict(df, days)
            _set_cache(f"forecast_{days}", result)
        print(f"[Forecast] Cache refreshed at {datetime.now().strftime('%H:%M:%S')}")
    except Exception as e:
        print(f"[Forecast] Background refresh failed: {e}")


# ─── Public API ───────────────────────────────────────────────────────────────
def train_and_forecast(days: int = 30) -> Dict[str, Any]:
    cache_key = f"forecast_{days}"

    if _cache_is_fresh(cache_key):
        return _get_cached(cache_key)

    t = threading.Thread(target=_refresh_cache_background, daemon=True)
    t.start()

    stale = _get_cached(cache_key)
    if stale is not None:
        return stale

    df = _fetch_sales_data()
    if df.empty or len(df) < 30:
        raise ValueError(
            "Insufficient data for forecasting (min 30 days required) or analytics service offline"
        )
    result = _train_and_predict(df, days)
    _set_cache(cache_key, result)
    return result


# ─── Pre-warm on startup ──────────────────────────────────────────────────────
def prewarm_forecast():
    try:
        print("[Forecast] Pre-warming forecast cache...")
        df = _fetch_sales_data()
        if df.empty or len(df) < 30:
            print("[Forecast] Not enough data to pre-warm.")
            return
        for days in [30, 90]:
            result = _train_and_predict(df, days)
            _set_cache(f"forecast_{days}", result)
        print("[Forecast] Cache pre-warmed ✓ (30d + 90d ready)")
    except Exception as e:
        print(f"[Forecast] Pre-warm failed (non-critical): {e}")