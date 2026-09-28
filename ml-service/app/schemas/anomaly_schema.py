from pydantic import BaseModel, Field


class AnomalyRequest(BaseModel):
    paymentAmount: float = Field(ge=0)
    expectedAmount: float = Field(gt=0)
    differenceAmount: float
    differencePercentage: float = Field(ge=0)
    daysLate: float
    previousPaymentAverage: float = Field(ge=0)
    previousPaymentStd: float = Field(ge=0)
    previousPaymentCount: int = Field(ge=0)
    previousFailedPaymentCount: int = Field(ge=0)
    previousExceptionCount: int = Field(ge=0)


class AnomalyResponse(BaseModel):
    isAnomaly: bool
    anomalyScore: float = Field(ge=0, le=1)
    riskLevel: str
    model: str
    modelVersion: str
    features: dict[str, float]
