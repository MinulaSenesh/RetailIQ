# routers/analytics.py — RFM and KPI analytics router (non-blocking)

from fastapi import APIRouter, HTTPException, Query
from fastapi.concurrency import run_in_threadpool
from models.schemas import RfmRequest, RfmResponse, RfmSegment
from services import rfm_service, forecast_service

router = APIRouter()


@router.post("/rfm", response_model=RfmResponse)
async def run_rfm_segmentation(request: RfmRequest = None):
    try:
        ref_date = request.reference_date if request else None
        result = await run_in_threadpool(rfm_service.compute_rfm, ref_date)
        return RfmResponse(
            segments=[RfmSegment(**s) for s in result["segments"]],
            total_customers=result["total_customers"],
            updated_at=result["updated_at"],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/rfm/refresh", response_model=RfmResponse)
async def force_refresh_rfm(request: RfmRequest = None):
    try:
        ref_date = request.reference_date if request else None
        result = await run_in_threadpool(rfm_service.compute_rfm, ref_date, True)
        return RfmResponse(
            segments=[RfmSegment(**s) for s in result["segments"]],
            total_customers=result["total_customers"],
            updated_at=result["updated_at"],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sales")
async def get_sales_analytics(days: int = Query(default=30, ge=1, le=365)):
    try:
        result = await run_in_threadpool(forecast_service.train_and_forecast, days)
        return result
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
