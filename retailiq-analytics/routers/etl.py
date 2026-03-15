# routers/etl.py — ETL endpoint router (non-blocking)

from fastapi import APIRouter, BackgroundTasks, HTTPException
from fastapi.concurrency import run_in_threadpool
from models.schemas import EtlRequest, EtlStatusResponse, ValidationResult
from services import etl_service

router = APIRouter()

# In-memory job status store
_job_status: dict[int, dict] = {}


@router.post("/process", response_model=EtlStatusResponse)
async def process_file(request: EtlRequest, background_tasks: BackgroundTasks):
    """Trigger ETL pipeline asynchronously in background."""
    _job_status[request.job_id] = {
        "status": "PROCESSING", "total_rows": 0,
        "inserted_rows": 0, "skipped_rows": 0, "error_rows": 0,
    }

    async def run_async():
        result = await run_in_threadpool(
            etl_service.run_etl, request.job_id, request.file_path
        )
        _job_status[request.job_id] = result

    background_tasks.add_task(run_async)

    return EtlStatusResponse(
        job_id=request.job_id,
        status="PROCESSING",
        message="ETL pipeline started in background",
    )


@router.post("/validate", response_model=ValidationResult)
async def validate_file(request: EtlRequest):
    """Validate file schema without importing data."""
    try:
        def _validate():
            df = etl_service.load_file(request.file_path)
            schema = etl_service.validate_schema(df)
            if not schema["valid"]:
                return ValidationResult(
                    valid=False,
                    total_rows=len(df),
                    error_rows=0,
                    errors=[{"error": f"Missing columns: {schema['missing_columns']}"}],
                )
            df_clean, errors = etl_service.clean_data(df)
            rule_errors = etl_service.validate_business_rules(df_clean)
            all_errors = errors + rule_errors
            sample = df_clean.head(10).fillna("").to_dict("records")
            return ValidationResult(
                valid=len(all_errors) == 0,
                total_rows=len(df),
                error_rows=len(all_errors),
                errors=all_errors[:50],
                sample=sample,
            )

        return await run_in_threadpool(_validate)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status/{job_id}", response_model=EtlStatusResponse)
async def get_status(job_id: int):
    """Get the current status of an ETL job."""
    status = _job_status.get(job_id)
    if status is None:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
    return EtlStatusResponse(job_id=job_id, **status)