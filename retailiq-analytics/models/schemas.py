# models/schemas.py — Pydantic models for the analytics microservice

from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import date


class EtlRequest(BaseModel):
    job_id: int
    file_path: str
    original_name: str


class EtlStatusResponse(BaseModel):
    job_id: int
    status: str  # PENDING | PROCESSING | COMPLETE | FAILED
    total_rows: int = 0
    inserted_rows: int = 0
    skipped_rows: int = 0
    error_rows: int = 0
    errors: Optional[List[dict]] = None
    message: Optional[str] = None


class ValidationResult(BaseModel):
    valid: bool
    total_rows: int
    error_rows: int
    errors: List[dict]
    sample: Optional[List[dict]] = None


class RfmRequest(BaseModel):
    reference_date: Optional[date] = None


class RfmSegment(BaseModel):
    segment: str
    count: int
    percentage: float


class RfmResponse(BaseModel):
    segments: List[RfmSegment]
    total_customers: int
    updated_at: str


class ForecastRequest(BaseModel):
    days: int = Field(default=30, ge=7, le=365)


class ForecastPoint(BaseModel):
    date: str
    predicted: float
    lower_bound: float
    upper_bound: float


class ForecastResponse(BaseModel):
    predictions: List[ForecastPoint]
    mae: float
    rmse: float
    r2: float
    days_forecasted: int
    model: str = "RandomForestRegressor"
