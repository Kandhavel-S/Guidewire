from app.models.late_payment_model import MODEL_VERSION, load_model
from app.schemas.prediction_schema import LatePaymentRequest, LatePaymentResponse
from app.services.feature_service import LATE_PAYMENT_FEATURES, late_payment_features


def risk_level(probability: float) -> str:
    if probability >= 0.75:
        return "HIGH"
    if probability >= 0.5:
        return "MEDIUM"
    return "LOW"


def predict_late_payment(request: LatePaymentRequest) -> LatePaymentResponse:
    values = late_payment_features(request)
    model = load_model()
    probability = float(model.predict_proba([values])[0][1])
    return LatePaymentResponse(
        latePaymentProbability=round(probability, 4),
        riskLevel=risk_level(probability),
        model="XGBoost",
        modelVersion=MODEL_VERSION,
        features=dict(zip(LATE_PAYMENT_FEATURES, values)),
    )
