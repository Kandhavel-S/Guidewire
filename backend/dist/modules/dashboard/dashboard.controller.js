"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardSummary = getDashboardSummary;
exports.getPremiumTrend = getPremiumTrend;
exports.getExceptionDistribution = getExceptionDistribution;
exports.getSeverityDistribution = getSeverityDistribution;
exports.getRecentExceptions = getRecentExceptions;
const database_1 = require("../../config/database");
const response_1 = require("../../utils/response");
async function getDashboardSummary(_req, res) {
    const [invoiceAgg, successPaymentsAgg, openExceptionsCount, resolvedExceptionsCount, criticalExceptionsCount, totalExceptionsCount, matchedRecordsCount, totalInvoicesCount, failedPaymentsCount, latestRun,] = await Promise.all([
        // Expected premium = sum of all non-cancelled invoice totals
        database_1.prisma.invoice.aggregate({
            where: { status: { not: 'CANCELLED' } },
            _sum: { totalAmount: true },
        }),
        // Received premium = sum of all successful payments
        database_1.prisma.payment.aggregate({
            where: { status: 'SUCCESS' },
            _sum: { amount: true },
        }),
        database_1.prisma.paymentException.count({ where: { status: { not: 'RESOLVED' } } }),
        database_1.prisma.paymentException.count({ where: { status: 'RESOLVED' } }),
        database_1.prisma.paymentException.count({
            where: { severity: 'CRITICAL', status: { not: 'RESOLVED' } },
        }),
        database_1.prisma.paymentException.count(),
        database_1.prisma.reconciliationRecord.count({ where: { status: 'MATCHED' } }),
        database_1.prisma.invoice.count({ where: { status: { not: 'CANCELLED' } } }),
        database_1.prisma.payment.count({ where: { status: 'FAILED' } }),
        database_1.prisma.reconciliationRun.findFirst({
            where: { status: 'COMPLETED' },
            orderBy: { completedAt: 'desc' },
            select: { runNumber: true, completedAt: true, recordsProcessed: true },
        }),
    ]);
    const expectedPremium = Number(invoiceAgg._sum.totalAmount || 0);
    const receivedPremium = Number(successPaymentsAgg._sum.amount || 0);
    const outstandingAmount = Math.max(0, expectedPremium - receivedPremium);
    const reconciliationRate = totalInvoicesCount > 0
        ? ((matchedRecordsCount / totalInvoicesCount) * 100).toFixed(1)
        : '0.0';
    (0, response_1.sendSuccess)(res, {
        expectedPremium,
        receivedPremium,
        outstandingAmount,
        matchedPayments: matchedRecordsCount,
        openExceptions: openExceptionsCount,
        resolvedExceptions: resolvedExceptionsCount,
        criticalExceptions: criticalExceptionsCount,
        totalExceptions: totalExceptionsCount,
        failedPayments: failedPaymentsCount,
        reconciliationRate: parseFloat(reconciliationRate),
        totalInvoices: totalInvoicesCount,
        lastReconciliationRun: latestRun,
    });
}
async function getPremiumTrend(_req, res) {
    // Generate last 12 months premium trend from payments
    const months = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        const monthLabel = date.toLocaleString('default', { month: 'short', year: '2-digit' });
        const [expectedAgg, receivedAgg] = await Promise.all([
            database_1.prisma.invoice.aggregate({
                where: {
                    createdAt: { gte: date, lt: nextDate },
                    status: { not: 'CANCELLED' },
                },
                _sum: { totalAmount: true },
            }),
            database_1.prisma.payment.aggregate({
                where: {
                    status: 'SUCCESS',
                    paymentDate: { gte: date, lt: nextDate },
                },
                _sum: { amount: true },
            }),
        ]);
        months.push({
            month: monthLabel,
            expected: Number(expectedAgg._sum.totalAmount || 0),
            received: Number(receivedAgg._sum.amount || 0),
        });
    }
    (0, response_1.sendSuccess)(res, months);
}
async function getExceptionDistribution(_req, res) {
    const distribution = await database_1.prisma.paymentException.groupBy({
        by: ['type'],
        _count: { _all: true },
    });
    const data = distribution.map((d) => ({
        type: d.type,
        count: d._count._all,
    }));
    (0, response_1.sendSuccess)(res, data);
}
async function getSeverityDistribution(_req, res) {
    const distribution = await database_1.prisma.paymentException.groupBy({
        by: ['severity'],
        where: { status: { not: 'RESOLVED' } },
        _count: { _all: true },
    });
    const data = distribution.map((d) => ({
        severity: d.severity,
        count: d._count._all,
    }));
    (0, response_1.sendSuccess)(res, data);
}
async function getRecentExceptions(_req, res) {
    const exceptions = await database_1.prisma.paymentException.findMany({
        where: { status: { not: 'RESOLVED' } },
        orderBy: { createdAt: 'desc' },
        take: 6,
        include: {
            policy: {
                include: { policyholder: { select: { name: true } } },
            },
            assignedTo: { select: { name: true } },
        },
    });
    (0, response_1.sendSuccess)(res, exceptions);
}
//# sourceMappingURL=dashboard.controller.js.map