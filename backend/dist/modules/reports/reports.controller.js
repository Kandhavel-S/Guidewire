"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReconciliationReport = getReconciliationReport;
exports.getExceptionsReport = getExceptionsReport;
exports.getPaymentsReport = getPaymentsReport;
exports.exportExceptionsCSV = exportExceptionsCSV;
exports.exportReconciliationCSV = exportReconciliationCSV;
exports.exportPaymentsCSV = exportPaymentsCSV;
const database_1 = require("../../config/database");
const response_1 = require("../../utils/response");
// Helper: convert array to CSV string
function arrayToCSV(data) {
    if (data.length === 0)
        return '';
    const headers = Object.keys(data[0]);
    const rows = data.map((row) => headers.map((h) => {
        const val = row[h];
        const str = val === null || val === undefined ? '' : String(val);
        return str.includes(',') ? `"${str}"` : str;
    }).join(','));
    return [headers.join(','), ...rows].join('\n');
}
async function getReconciliationReport(_req, res) {
    const [runs, invoiceStats] = await Promise.all([
        database_1.prisma.reconciliationRun.findMany({
            orderBy: { startedAt: 'desc' },
            take: 20,
        }),
        database_1.prisma.invoice.groupBy({
            by: ['status'],
            _count: { _all: true },
            _sum: { totalAmount: true },
        }),
    ]);
    (0, response_1.sendSuccess)(res, { runs, invoiceStats });
}
async function getExceptionsReport(_req, res) {
    const [byType, bySeverity, byStatus, recent] = await Promise.all([
        database_1.prisma.paymentException.groupBy({
            by: ['type'],
            _count: { _all: true },
            _sum: { difference: true },
        }),
        database_1.prisma.paymentException.groupBy({
            by: ['severity'],
            _count: { _all: true },
        }),
        database_1.prisma.paymentException.groupBy({
            by: ['status'],
            _count: { _all: true },
        }),
        database_1.prisma.paymentException.findMany({
            where: { status: { not: 'RESOLVED' } },
            orderBy: { createdAt: 'desc' },
            take: 20,
            include: {
                policy: {
                    include: { policyholder: { select: { name: true } } },
                },
                assignedTo: { select: { name: true } },
            },
        }),
    ]);
    (0, response_1.sendSuccess)(res, { byType, bySeverity, byStatus, recent });
}
async function getPaymentsReport(_req, res) {
    const [byStatus, byMethod, recentFailed] = await Promise.all([
        database_1.prisma.payment.groupBy({
            by: ['status'],
            _count: { _all: true },
            _sum: { amount: true },
        }),
        database_1.prisma.payment.groupBy({
            by: ['paymentMethod'],
            _count: { _all: true },
            _sum: { amount: true },
        }),
        database_1.prisma.payment.findMany({
            where: { status: 'FAILED' },
            orderBy: { paymentDate: 'desc' },
            take: 20,
            include: {
                policy: {
                    include: { policyholder: { select: { name: true } } },
                },
                invoice: { select: { invoiceNumber: true } },
            },
        }),
    ]);
    (0, response_1.sendSuccess)(res, { byStatus, byMethod, recentFailed });
}
// CSV EXPORTS
async function exportExceptionsCSV(_req, res) {
    const exceptions = await database_1.prisma.paymentException.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            policy: {
                include: { policyholder: { select: { name: true } } },
            },
            invoice: { select: { invoiceNumber: true } },
            assignedTo: { select: { name: true } },
        },
    });
    const csvData = exceptions.map((e) => ({
        ExceptionNumber: e.exceptionNumber,
        Type: e.type,
        PolicyNumber: e.policy.policyNumber,
        Customer: e.policy.policyholder.name,
        InvoiceNumber: e.invoice.invoiceNumber,
        ExpectedAmount: Number(e.expectedAmount),
        ActualAmount: Number(e.actualAmount),
        Difference: Number(e.difference),
        Severity: e.severity,
        Status: e.status,
        AssignedTo: e.assignedTo?.name || 'Unassigned',
        CreatedAt: e.createdAt.toISOString(),
        ResolvedAt: e.resolvedAt?.toISOString() || '',
    }));
    const csv = arrayToCSV(csvData);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="insureflow_exceptions.csv"');
    res.send(csv);
}
async function exportReconciliationCSV(_req, res) {
    const latestRun = await database_1.prisma.reconciliationRun.findFirst({
        where: { status: 'COMPLETED' },
        orderBy: { completedAt: 'desc' },
        include: {
            records: {
                include: {
                    invoice: { select: { invoiceNumber: true } },
                    policy: {
                        include: { policyholder: { select: { name: true } } },
                    },
                    exception: { select: { exceptionNumber: true } },
                },
            },
        },
    });
    if (!latestRun) {
        res.status(404).json({ success: false, message: 'No completed reconciliation run found' });
        return;
    }
    const csvData = latestRun.records.map((r) => ({
        RunNumber: latestRun.runNumber,
        InvoiceNumber: r.invoice.invoiceNumber,
        PolicyNumber: r.policy.policyNumber,
        Customer: r.policy.policyholder.name,
        ExpectedAmount: Number(r.expectedAmount),
        ActualAmount: Number(r.actualAmount),
        Difference: Number(r.difference),
        Status: r.status,
        ExceptionNumber: r.exception?.exceptionNumber || '',
        CreatedAt: r.createdAt.toISOString(),
    }));
    const csv = arrayToCSV(csvData);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="insureflow_reconciliation.csv"');
    res.send(csv);
}
async function exportPaymentsCSV(_req, res) {
    const payments = await database_1.prisma.payment.findMany({
        orderBy: { paymentDate: 'desc' },
        include: {
            policy: {
                include: { policyholder: { select: { name: true } } },
            },
            invoice: { select: { invoiceNumber: true } },
        },
    });
    const csvData = payments.map((p) => ({
        TransactionId: p.transactionId,
        PolicyNumber: p.policy.policyNumber,
        Customer: p.policy.policyholder.name,
        InvoiceNumber: p.invoice.invoiceNumber,
        Amount: Number(p.amount),
        PaymentMethod: p.paymentMethod,
        Status: p.status,
        PaymentDate: p.paymentDate.toISOString(),
        ReferenceNumber: p.referenceNumber || '',
    }));
    const csv = arrayToCSV(csvData);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="insureflow_payments.csv"');
    res.send(csv);
}
//# sourceMappingURL=reports.controller.js.map