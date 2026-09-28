import { AnomalyRequest, LatePaymentRequest, MLResult } from './ml.types';
export declare function predictAnomaly(payload: AnomalyRequest): Promise<MLResult>;
export declare function predictLatePayment(payload: LatePaymentRequest): Promise<MLResult>;
export declare function analyzeException(exceptionId: string): Promise<void>;
export declare function getExceptionPredictions(exceptionId: string): Promise<{
    id: string;
    createdAt: Date;
    paymentId: string | null;
    exceptionId: string | null;
    predictionType: import(".prisma/client").$Enums.MLPredictionType;
    modelName: string;
    modelVersion: string;
    score: number;
    riskLevel: string;
    prediction: boolean | null;
    features: import("@prisma/client/runtime/library").JsonValue | null;
}[]>;
export declare function getPredictions(): Promise<({
    payment: ({
        policy: {
            policyholder: {
                name: string;
                id: string;
                email: string;
                createdAt: Date;
                updatedAt: Date;
                customerNumber: string;
                phone: string;
                address: string;
                city: string;
                state: string;
                postalCode: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.PolicyStatus;
            policyNumber: string;
            policyholderId: string;
            policyType: import(".prisma/client").$Enums.PolicyType;
            premiumAmount: import("@prisma/client/runtime/library").Decimal;
            billingFrequency: import(".prisma/client").$Enums.BillingFrequency;
            effectiveDate: Date;
            expirationDate: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        invoiceId: string;
        policyId: string;
        status: import(".prisma/client").$Enums.PaymentStatus;
        transactionId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        paymentDate: Date;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
        referenceNumber: string | null;
        gatewayResponse: string | null;
    }) | null;
    exception: {
        exceptionNumber: string;
        type: import(".prisma/client").$Enums.ExceptionType;
    } | null;
} & {
    id: string;
    createdAt: Date;
    paymentId: string | null;
    exceptionId: string | null;
    predictionType: import(".prisma/client").$Enums.MLPredictionType;
    modelName: string;
    modelVersion: string;
    score: number;
    riskLevel: string;
    prediction: boolean | null;
    features: import("@prisma/client/runtime/library").JsonValue | null;
})[]>;
//# sourceMappingURL=ml.service.d.ts.map