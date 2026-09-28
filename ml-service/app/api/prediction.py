from fastapi import APIRouter, HTTPException

from app.schemas.prediction_schema import LatePaymentRequest, LatePaymentResponse
from app.services.prediction_service import predict_late_payment

router = APIRouter(prefix="/predictions", tags=["prediction"])


@router.post("/late-payment", response_model=LatePaymentResponse)
def predict(request: LatePaymentRequest) -> LatePaymentResponse:
    try:
        return predict_late_payment(request)
    except FileNotFoundError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
