"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startReconciliation = startReconciliation;
exports.getReconciliationRuns = getReconciliationRuns;
exports.getReconciliationRunById = getReconciliationRunById;
exports.getLatestReconciliationResults = getLatestReconciliationResults;
const database_1 = require("../../config/database");
const response_1 = require("../../utils/response");
const reconciliation_service_1 = require("./reconciliation.service");
async function startReconciliation(req, res) {
    try {
        // Create a new reconciliation run record
        const runCount = await database_1.prisma.reconciliationRun.count();
        const runNumber = `RUN-${String(runCount + 1).padStart(5, '0')}`;
        const run = await database_1.prisma.reconciliationRun.create({
            data: {
                runNumber,
                status: 'RUNNING',
                startedAt: new Date(),
            },
        });
        // Run the reconciliation engine (async but we wait for result)
        const result = await (0, reconciliation_service_1.runReconciliationEngine)(run.id);
        // Update the run with results
        const updatedRun = await database_1.prisma.reconciliationRun.update({
            where: { id: run.id },
            data: {
                status: 'COMPLETED',
                completedAt: new Date(),
                recordsProcessed: result.recordsProcessed,
                matchedRecords: result.matchedRecords,
                exceptionRecords: result.exceptionRecords,
                totalExpectedAmount: result.totalExpectedAmount,
                totalReceivedAmount: result.totalReceivedAmount,
                totalDifference: result.totalDifference,
            },
            include: {
                records: {
                    include: {
                        invoice: { select: { invoiceNumber: true } },
                        policy: {
                            include: {
                                policyholder: { select: { name: true } },
                            },
                        },
                        exception: { select: { exceptionNumber: true } },
                    },
                },
            },
        });
        // Log audit
        await database_1.prisma.auditLog.create({
            data: {
                userId: req.user?.id,
                action: 'RUN_RECONCILIATION',
                entityType: 'ReconciliationRun',
                entityId: run.id,
                newValue: {
                    recordsProcessed: result.recordsProcessed,
                    matchedRecords: result.matchedRecords,
                    exceptionRecords: result.exceptionRecords,
                },
            },
        });
        (0, response_1.sendSuccess)(res, updatedRun, 201);
    }
    catch (error) {
        console.error('[Reconciliation] Error:', error);
        // Try to mark the run as failed if we have a run ID
        (0, response_1.sendError)(res, 'Reconciliation engine failed', 500, 'RECONCILIATION_ERROR');
    }
}
async function getReconciliationRuns(req, res) {
    const { page, limit, skip } = (0, response_1.getPaginationParams)(req.query);
    const [total, runs] = await Promise.all([
        database_1.prisma.reconciliationRun.count(),
        database_1.prisma.reconciliationRun.findMany({
            skip,
            take: limit,
            orderBy: { startedAt: 'desc' },
            include: {
                _count: { select: { records: true } },
            },
        }),
    ]);
    (0, response_1.sendPaginated)(res, runs, {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
    });
}
async function getReconciliationRunById(req, res) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const run = await database_1.prisma.reconciliationRun.findFirst({
        where: { OR: [{ id }, { runNumber: id }] },
        include: {
            records: {
                include: {
                    invoice: { select: { invoiceNumber: true, dueDate: true } },
                    policy: {
                        include: {
                            policyholder: { select: { name: true } },
                        },
                    },
                    payment: { select: { transactionId: true, paymentMethod: true } },
                    exception: {
                        select: {
                            id: true,
                            exceptionNumber: true,
                            type: true,
                            status: true,
                            severity: true,
                        },
                    },
                },
                orderBy: { createdAt: 'asc' },
            },
        },
    });
    if (!run) {
        (0, response_1.sendError)(res, `Reconciliation run not found: ${id}`, 404, 'RUN_NOT_FOUND');
        return;
    }
    (0, response_1.sendSuccess)(res, run);
}
async function getLatestReconciliationResults(req, res) {
    const latestRun = await database_1.prisma.reconciliationRun.findFirst({
        where: { status: 'COMPLETED' },
        orderBy: { completedAt: 'desc' },
        include: {
            records: {
                include: {
                    invoice: { select: { invoiceNumber: true } },
                    policy: {
                        include: {
                            policyholder: { select: { name: true } },
                        },
                    },
                    exception: {
                        select: { id: true, exceptionNumber: true, type: true, status: true },
                    },
                },
                orderBy: { createdAt: 'asc' },
            },
        },
    });
    (0, response_1.sendSuccess)(res, latestRun);
}
//# sourceMappingURL=reconciliation.controller.js.map