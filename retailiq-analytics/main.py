from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import analytics, etl, forecast
from services import forecast_service, rfm_service
import threading

app = FastAPI(
    title="RetailIQ Analytics API",
    description="Retail analytics, ETL, and forecasting API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
app.include_router(etl.router, prefix="/etl", tags=["ETL"])
app.include_router(forecast.router, prefix="/forecast", tags=["Forecast"])


@app.on_event("startup")
async def startup_event():
    """Pre-warm all caches on startup in background threads."""
    threading.Thread(target=forecast_service.prewarm_forecast, daemon=True).start()
    threading.Thread(target=rfm_service.prewarm_rfm, daemon=True).start()


@app.get("/")
def root():
    return {"message": "RetailIQ Analytics API is running"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}