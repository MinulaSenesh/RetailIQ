# Forecast Chart Fix Summary

## Root Cause
The forecast API endpoint was returning 500 errors due to **field name mismatches** between the backend and frontend, plus a **malformed router configuration**.

## Issues Fixed

### 1. **Field Name Mismatch - CRITICAL** 
The Python service returns snake_case JSON, but code was expecting different field names.

**Solution:** Standardized on snake_case throughout the entire stack:

#### Backend - `retailiq-analytics/models/schemas.py`
```python
class ForecastPoint(BaseModel):
    date: str
    predicted: float
    lower_bound: float      # ← snake_case (matches service output)
    upper_bound: float      # ← snake_case (matches service output)

class ForecastResponse(BaseModel):
    predictions: List[ForecastPoint]
    mae: float
    rmse: float
    r2: float
    days_forecasted: int    # ← snake_case (matches service output)
    model: str = "RandomForestRegressor"
```

#### Frontend - `retailiq-frontend/src/types/index.ts`
```typescript
export interface ForecastPoint {
    date: string;
    predicted: number;
    lower_bound: number;    // ← Updated to match backend
    upper_bound: number;    // ← Updated to match backend
}

export interface ForecastData {
    predictions: ForecastPoint[];
    mae: number;
    rmse: number;
    r2: number;
    days_forecasted: number; // ← Updated to match backend
}
```

#### Frontend Chart Component - `retailiq-frontend/src/pages/AnalyticsPage.tsx`
```tsx
<Area dataKey="upper_bound" ... /> {/* was: upperBound */}
<Area dataKey="lower_bound" ... /> {/* was: lowerBound */}
<Line dataKey="predicted" ... />
```

### 2. **Malformed Router Endpoint**
**Problem:** Duplicate GET decorators caused routing conflicts
```python
# BEFORE (broken):
@router.get("/sales", response_model=ForecastResponse)

@router.get("", response_model=ForecastResponse)  # ← Empty path, conflicts
async def get_sales_forecast(...):
```

**Fix:** Removed empty path decorator
```python
# AFTER (fixed):
@router.get("/sales", response_model=ForecastResponse)
async def get_sales_forecast(...):
```

## Modified Files

| File | Changes |
|------|---------|
| `retailiq-analytics/models/schemas.py` | Updated ForecastPoint and ForecastResponse to use snake_case field names |
| `retailiq-analytics/routers/forecast.py` | Removed duplicate `@router.get("")` decorator |
| `retailiq-frontend/src/types/index.ts` | Updated ForecastPoint and ForecastData interfaces to use snake_case |
| `retailiq-frontend/src/pages/AnalyticsPage.tsx` | Updated chart dataKeys from camelCase to snake_case |

## Deployment Instructions

### Prerequisites
- **Docker Desktop** must be installed: https://docs.docker.com/desktop/install/windows-install/

### Steps
1. If Docker Desktop is not installed, download and install it first
2. Restart your terminal/PowerShell after Docker installation
3. Navigate to the project directory and rebuild:
   ```powershell
   cd d:\RetailQ
   docker compose up --build -d
   ```
4. Wait 30-60 seconds for all services to start
5. Open browser and navigate to http://localhost:3000
6. Go to **Analytics** → **Forecast** tab
7. The chart should now render without 500 errors

## Verification

Once running, you can test the API endpoint directly:
```bash
curl http://localhost:8000/forecast/sales?days=30
```

Expected successful response (snake_case fields):
```json
{
  "predictions": [
    {
      "date": "2026-03-14",
      "predicted": 5000.00,
      "lower_bound": 4500.00,
      "upper_bound": 5500.00
    }
  ],
  "mae": 450.50,
  "rmse": 550.00,
  "r2": 0.8750,
  "days_forecasted": 30,
  "model": "RandomForestRegressor"
}
```

## What the Chart Will Show
- ✅ Line graph of predicted sales
- ✅ Confidence band (upper and lower bounds as shaded areas)
- ✅ Model quality metrics (MAE, RMSE, R²)
- ✅ Toggle between 30 and 90-day forecasts
- ✅ No 500 errors in browser console
