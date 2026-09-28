from app.models.anomaly_model import MODEL_VERSION, load_model, score_model
from app.schemas.anomaly_schema import AnomalyRequest, AnomalyResponse
from app.services.feature_service import ANOMALY_FEATURES, anomaly_features


def risk_level(score: float) -> str:
    if score >= 0.75:
        return "HIGH"
    if score >= 0.5:
        return "MEDIUM"
    return "LOW"


def predict_anomaly(request: AnomalyRequest) -> AnomalyResponse:
    values = anomaly_features(request)
    model = load_model()
    is_anomaly, score = score_model(model, values)
    return AnomalyResponse(
        isAnomaly=is_anomaly,
        anomalyScore=round(score, 4),
        riskLevel=risk_level(score),
        model="IsolationForest",
        modelVersion=MODEL_VERSION,
        features=dict(zip(ANOMALY_FEATURES, values)),
    )
