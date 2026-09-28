from fastapi import APIRouter, HTTPException

from app.schemas.anomaly_schema import AnomalyRequest, AnomalyResponse
from app.services.anomaly_service import predict_anomaly

router = APIRouter(prefix="/anomaly", tags=["anomaly"])


@router.post("/predict", response_model=AnomalyResponse)
def predict(request: AnomalyRequest) -> AnomalyResponse:
    try:
        return predict_anomaly(request)
    except FileNotFoundError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
