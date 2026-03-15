# routers/forecast.py — Sales Forecasting Router (non-blocking)

from fastapi import APIRouter, HTTPException, Query
from fastapi.concurrency import run_in_threadpool
from models.schemas import ForecastRequest, ForecastResponse, ForecastPoint
from services import forecast_service

router = APIRouter()


@router.post("/forecast", response_model=ForecastResponse)
async def generate_forecast(request: ForecastRequest):
    """Generate a sales revenue forecast for the next N days using ML."""
    try:
        result = await run_in_threadpool(forecast_service.train_and_forecast, request.days)
        return ForecastResponse(
            predictions=[ForecastPoint(**p) for p in result["predictions"]],
            mae=result["mae"],
            rmse=result["rmse"],
            r2=result["r2"],
            days_forecasted=result["days_forecasted"],
            model=result["model"],
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sales", response_model=ForecastResponse)
async def get_sales_forecast(
    days: int = Query(default=30, ge=1, le=365)
):
    """GET endpoint for sales forecast."""
    try:
        result = await run_in_threadpool(forecast_service.train_and_forecast, days)
        return ForecastResponse(
            predictions=[ForecastPoint(**p) for p in result["predictions"]],
            mae=result["mae"],
            rmse=result["rmse"],
            r2=result["r2"],
            days_forecasted=result["days_forecasted"],
            model=result["model"],
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
