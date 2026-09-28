export type MLPredictionType = 'PAYMENT_ANOMALY' | 'LATE_PAYMENT';
export type MLRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export interface AnomalyRequest {
    paymentAmount: number;
    expectedAmount: number;
    differenceAmount: number;
    differencePercentage: number;
    daysLate: number;
    previousPaymentAverage: number;
    previousPaymentStd: number;
    previousPaymentCount: number;
    previousFailedPaymentCount: number;
    previousExceptionCount: number;
}
export interface LatePaymentRequest {
    averagePaymentDelay: number;
    previousLatePaymentCount: number;
    previousPaymentCount: number;
    previousFailedPaymentCount: number;
    previousExceptionCount: number;
    paymentAmount: number;
    invoiceAmount: number;
    paymentToInvoiceRatio: number;
    recentPaymentDelay: number;
    paymentFrequency: number;
}
export interface MLResult {
    isAnomaly?: boolean;
    anomalyScore?: number;
    latePaymentProbability?: number;
    riskLevel: MLRiskLevel;
    model: string;
    modelVersion: string;
    features: Record<string, number>;
}
//# sourceMappingURL=ml.types.d.ts.map