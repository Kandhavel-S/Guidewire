import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { prisma } from '../../config/database';
import { sendSuccess, sendPaginated, sendError, getPaginationParams } from '../../utils/response';
import { runReconciliationEngine } from './reconciliation.service';

export async function startReconciliation(req: AuthRequest, res: Response): Promise<void> {
  try {
    // Create a new reconciliation run record
    const runCount = await prisma.reconciliationRun.count();
    const runNumber = `RUN-${String(runCount + 1).padStart(5, '0')}`;

    const run = await prisma.reconciliationRun.create({
      data: {
        runNumber,
        status: 'RUNNING',
        startedAt: new Date(),
      },
    });

    // Run the reconciliation engine (async but we wait for result)
    const result = await runReconciliationEngine(run.id);

    // Update the run with results
    const updatedRun = await prisma.reconciliationRun.update({
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
    await prisma.auditLog.create({
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

    sendSuccess(res, updatedRun, 201);
  } catch (error) {
    console.error('[Reconciliation] Error:', error);

    // Try to mark the run as failed if we have a run ID
    sendError(res, 'Reconciliation engine failed', 500, 'RECONCILIATION_ERROR');
  }
}

export async function getReconciliationRuns(req: AuthRequest, res: Response): Promise<void> {
  const { page, limit, skip } = getPaginationParams(req.query as Record<string, unknown>);

  const [total, runs] = await Promise.all([
    prisma.reconciliationRun.count(),
    prisma.reconciliationRun.findMany({
      skip,
      take: limit,
      orderBy: { startedAt: 'desc' },
      include: {
        _count: { select: { records: true } },
      },
    }),
  ]);

  sendPaginated(res, runs, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
}

export async function getReconciliationRunById(req: AuthRequest, res: Response): Promise<void> {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const run = await prisma.reconciliationRun.findFirst({
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
    sendError(res, `Reconciliation run not found: ${id}`, 404, 'RUN_NOT_FOUND');
    return;
  }

  sendSuccess(res, run);
}

export async function getLatestReconciliationResults(req: AuthRequest, res: Response): Promise<void> {
  const latestRun = await prisma.reconciliationRun.findFirst({
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

  sendSuccess(res, latestRun);
}
