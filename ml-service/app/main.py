from fastapi import FastAPI

from app.api.anomaly import router as anomaly_router
from app.api.prediction import router as prediction_router

app = FastAPI(title="InsureFlow ML Service", version="1.0.0")
app.include_router(anomaly_router, prefix="/ml")
app.include_router(prediction_router, prefix="/ml")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "ml-service"}
