"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.predictAnomaly = predictAnomaly;
exports.predictLatePayment = predictLatePayment;
exports.analyzeException = analyzeException;
exports.getExceptionPredictions = getExceptionPredictions;
exports.getPredictions = getPredictions;
const database_1 = require("../../config/database");
const env_1 = require("../../config/env");
const ML_TIMEOUT_MS = 2500;
async function callML(endpoint, payload) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), ML_TIMEOUT_MS);
    try {
        const response = await fetch(`${env_1.env.ML_SERVICE_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal,
        });
        if (!response.ok) {
            throw new Error(`ML service returned ${response.status}`);
        }
        return await response.json();
    }
    finally {
        clearTimeout(timeout);
    }
}
async function predictAnomaly(payload) {
    return callML('/ml/anomaly/predict', payload);
}
async function predictLatePayment(payload) {
    return callML('/ml/predictions/late-payment', payload);
}
async function analyzeException(exceptionId) {
    try {
        const exception = await database_1.prisma.paymentException.findUnique({
            where: { id: exceptionId },
            include: {
                invoice: { include: { payments: { orderBy: { paymentDate: 'asc' } } } },
                payment: true,
                policy: { include: { exceptions: true, payments: true } },
            },
        });
        if (!exception)
            return;
        const payments = exception.policy.payments;
        const currentPayment = exception.payment;
        const previousPayments = payments.filter((payment) => payment.paymentDate < (currentPayment?.paymentDate || new Date()));
        const previousAmounts = previousPayments.map((payment) => Number(payment.amount));
        const previousAverage = previousAmounts.length
            ? previousAmounts.reduce((sum, amount) => sum + amount, 0) / previousAmounts.length
            : Number(exception.expectedAmount);
        const variance = previousAmounts.length > 1
            ? previousAmounts.reduce((sum, amount) => sum + (amount - previousAverage) ** 2, 0) / previousAmounts.length
            : 0;
        const expected = Number(exception.expectedAmount);
        const actual = Number(exception.actualAmount);
        const difference = Number(exception.difference);
        const daysLate = currentPayment
            ? Math.max(0, Math.ceil((currentPayment.paymentDate.getTime() - exception.invoice.dueDate.getTime()) / 86400000))
            : 0;
        const previousFailed = previousPayments.filter((payment) => payment.status === 'FAILED').length;
        const previousExceptions = exception.policy.exceptions.filter((item) => item.id !== exception.id).length;
        const featureSnapshot = {
            paymentAmount: actual,
            expectedAmount: expected,
            differenceAmount: difference,
            differencePercentage: expected ? Math.abs(difference) / expected * 100 : 0,
            daysLate,
            previousPaymentAverage: previousAverage,
            previousPaymentStd: Math.sqrt(variance),
            previousPaymentCount: previousPayments.length,
            previousFailedPaymentCount: previousFailed,
            previousExceptionCount: previousExceptions,
        };
        const anomaly = currentPayment
            ? await predictAnomaly(featureSnapshot)
            : null;
        if (anomaly) {
            await database_1.prisma.mLPrediction.create({
                data: {
                    paymentId: currentPayment?.id,
                    exceptionId,
                    predictionType: 'PAYMENT_ANOMALY',
                    modelName: anomaly.model,
                    modelVersion: anomaly.modelVersion,
                    score: anomaly.anomalyScore || 0,
                    riskLevel: anomaly.riskLevel,
                    prediction: anomaly.isAnomaly,
                    features: anomaly.features,
                },
            });
        }
        const late = await predictLatePayment({
            averagePaymentDelay: daysLate,
            previousLatePaymentCount: previousPayments.filter((payment) => payment.paymentDate > exception.invoice.dueDate).length,
            previousPaymentCount: previousPayments.length,
            previousFailedPaymentCount: previousFailed,
            previousExceptionCount: previousExceptions,
            paymentAmount: actual,
            invoiceAmount: expected,
            paymentToInvoiceRatio: expected ? actual / expected : 0,
            recentPaymentDelay: daysLate,
            paymentFrequency: previousPayments.length > 1
                ? Math.max(1, (previousPayments[previousPayments.length - 1].paymentDate.getTime() - previousPayments[0].paymentDate.getTime()) / 86400000 / (previousPayments.length - 1))
                : 30,
        });
        await database_1.prisma.mLPrediction.create({
            data: {
                paymentId: currentPayment?.id,
                exceptionId,
                predictionType: 'LATE_PAYMENT',
                modelName: late.model,
                modelVersion: late.modelVersion,
                score: late.latePaymentProbability || 0,
                riskLevel: late.riskLevel,
                prediction: (late.latePaymentProbability || 0) >= 0.5,
                features: late.features,
            },
        });
    }
    catch (error) {
        console.warn('[ML] Analysis unavailable; reconciliation remains authoritative:', error.message);
    }
}
async function getExceptionPredictions(exceptionId) {
    return database_1.prisma.mLPrediction.findMany({
        where: { exceptionId },
        orderBy: { createdAt: 'desc' },
    });
}
async function getPredictions() {
    let predictions = await database_1.prisma.mLPrediction.findMany({
        orderBy: { createdAt: 'desc' },
        take: 200,
        include: {
            payment: { include: { policy: { include: { policyholder: true } } } },
            exception: { select: { exceptionNumber: true, type: true } },
        },
    });
    if (predictions.length === 0) {
        await backfillPredictions();
        predictions = await database_1.prisma.mLPrediction.findMany({
            orderBy: { createdAt: 'desc' },
            take: 200,
            include: {
                payment: { include: { policy: { include: { policyholder: true } } } },
                exception: { select: { exceptionNumber: true, type: true } },
            },
        });
    }
    return predictions;
}
async function backfillPredictions() {
    const payments = await database_1.prisma.payment.findMany({
        where: { status: { in: ['SUCCESS', 'FAILED'] } },
        orderBy: { paymentDate: 'asc' },
        take: 100,
        include: {
            invoice: true,
            policy: { include: { policyholder: true } },
            exceptions: { orderBy: { createdAt: 'asc' } },
        },
    });
    for (const payment of payments) {
        const expected = Number(payment.invoice.totalAmount);
        const amount = Number(payment.amount);
        const difference = Math.abs(expected - amount);
        const differencePercentage = expected ? difference / expected * 100 : 0;
        const previousPayments = payments.filter((candidate) => candidate.policyId === payment.policyId && candidate.paymentDate < payment.paymentDate);
        const previousAmounts = previousPayments.map((candidate) => Number(candidate.amount));
        const previousAverage = previousAmounts.length
            ? previousAmounts.reduce((sum, value) => sum + value, 0) / previousAmounts.length
            : expected;
        const daysLate = Math.max(0, Math.ceil((payment.paymentDate.getTime() - payment.invoice.dueDate.getTime()) / 86400000));
        const anomalyScore = Math.min(0.99, Math.max(0.05, differencePercentage / 100 * 0.7 + (amount < previousAverage * 0.75 ? 0.25 : 0) + (payment.status === 'FAILED' ? 0.2 : 0)));
        const lateProbability = Math.min(0.99, Math.max(0.05, daysLate > 0 ? Math.min(0.95, 0.45 + daysLate / 30) : (payment.status === 'FAILED' ? 0.7 : 0.12)));
        const exception = payment.exceptions[0];
        await database_1.prisma.mLPrediction.createMany({
            data: [
                {
                    paymentId: payment.id,
                    exceptionId: exception?.id,
                    predictionType: 'PAYMENT_ANOMALY',
                    modelName: 'IsolationForest (advisory fallback)',
                    modelVersion: 'demo-1.0.0',
                    score: anomalyScore,
                    riskLevel: anomalyScore >= 0.7 ? 'HIGH' : anomalyScore >= 0.4 ? 'MEDIUM' : 'LOW',
                    prediction: anomalyScore >= 0.5,
                    features: { paymentAmount: amount, expectedAmount: expected, differenceAmount: difference, differencePercentage, daysLate, previousPaymentAverage: previousAverage },
                },
                {
                    paymentId: payment.id,
                    exceptionId: exception?.id,
                    predictionType: 'LATE_PAYMENT',
                    modelName: 'XGBoost (advisory fallback)',
                    modelVersion: 'demo-1.0.0',
                    score: lateProbability,
                    riskLevel: lateProbability >= 0.7 ? 'HIGH' : lateProbability >= 0.4 ? 'MEDIUM' : 'LOW',
                    prediction: lateProbability >= 0.5,
                    features: { averagePaymentDelay: daysLate, previousPaymentCount: previousPayments.length, paymentAmount: amount, invoiceAmount: expected, paymentToInvoiceRatio: expected ? amount / expected : 0 },
                },
            ],
        });
    }
}
//# sourceMappingURL=ml.service.js.map