from pydantic import BaseModel, Field


class LatePaymentRequest(BaseModel):
    averagePaymentDelay: float
    previousLatePaymentCount: int = Field(ge=0)
    previousPaymentCount: int = Field(ge=0)
    previousFailedPaymentCount: int = Field(ge=0)
    previousExceptionCount: int = Field(ge=0)
    paymentAmount: float = Field(ge=0)
    invoiceAmount: float = Field(gt=0)
    paymentToInvoiceRatio: float = Field(ge=0)
    recentPaymentDelay: float
    paymentFrequency: float = Field(ge=0)


class LatePaymentResponse(BaseModel):
    latePaymentProbability: float = Field(ge=0, le=1)
    riskLevel: str
    model: str
    modelVersion: str
    features: dict[str, float]
