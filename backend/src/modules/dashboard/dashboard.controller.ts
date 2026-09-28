import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { prisma } from '../../config/database';
import { sendSuccess } from '../../utils/response';

export async function getDashboardSummary(_req: AuthRequest, res: Response): Promise<void> {
  const [
    invoiceAgg,
    successPaymentsAgg,
    openExceptionsCount,
    resolvedExceptionsCount,
    criticalExceptionsCount,
    totalExceptionsCount,
    matchedRecordsCount,
    totalInvoicesCount,
    failedPaymentsCount,
    latestRun,
  ] = await Promise.all([
    // Expected premium = sum of all non-cancelled invoice totals
    prisma.invoice.aggregate({
      where: { status: { not: 'CANCELLED' } },
      _sum: { totalAmount: true },
    }),
    // Received premium = sum of all successful payments
    prisma.payment.aggregate({
      where: { status: 'SUCCESS' },
      _sum: { amount: true },
    }),
    prisma.paymentException.count({ where: { status: { not: 'RESOLVED' } } }),
    prisma.paymentException.count({ where: { status: 'RESOLVED' } }),
    prisma.paymentException.count({
      where: { severity: 'CRITICAL', status: { not: 'RESOLVED' } },
    }),
    prisma.paymentException.count(),
    prisma.reconciliationRecord.count({ where: { status: 'MATCHED' } }),
    prisma.invoice.count({ where: { status: { not: 'CANCELLED' } } }),
    prisma.payment.count({ where: { status: 'FAILED' } }),
    prisma.reconciliationRun.findFirst({
      where: { status: 'COMPLETED' },
      orderBy: { completedAt: 'desc' },
      select: { runNumber: true, completedAt: true, recordsProcessed: true },
    }),
  ]);

  const expectedPremium = Number(invoiceAgg._sum.totalAmount || 0);
  const receivedPremium = Number(successPaymentsAgg._sum.amount || 0);
  const outstandingAmount = Math.max(0, expectedPremium - receivedPremium);
  const reconciliationRate =
    totalInvoicesCount > 0
      ? ((matchedRecordsCount / totalInvoicesCount) * 100).toFixed(1)
      : '0.0';

  sendSuccess(res, {
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

export async function getPremiumTrend(_req: AuthRequest, res: Response): Promise<void> {
  // Generate last 12 months premium trend from payments
  const months: Array<{ month: string; expected: number; received: number }> = [];
  const now = new Date();

  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const monthLabel = date.toLocaleString('default', { month: 'short', year: '2-digit' });

    const [expectedAgg, receivedAgg] = await Promise.all([
      prisma.invoice.aggregate({
        where: {
          createdAt: { gte: date, lt: nextDate },
          status: { not: 'CANCELLED' },
        },
        _sum: { totalAmount: true },
      }),
      prisma.payment.aggregate({
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

  sendSuccess(res, months);
}

export async function getExceptionDistribution(_req: AuthRequest, res: Response): Promise<void> {
  const distribution = await prisma.paymentException.groupBy({
    by: ['type'],
    _count: { _all: true },
  });

  const data = distribution.map((d: any) => ({
    type: d.type,
    count: d._count._all,
  }));

  sendSuccess(res, data);
}

export async function getSeverityDistribution(_req: AuthRequest, res: Response): Promise<void> {
  const distribution = await prisma.paymentException.groupBy({
    by: ['severity'],
    where: { status: { not: 'RESOLVED' } },
    _count: { _all: true },
  });

  const data = distribution.map((d: any) => ({
    severity: d.severity,
    count: d._count._all,
  }));

  sendSuccess(res, data);
}

export async function getRecentExceptions(_req: AuthRequest, res: Response): Promise<void> {
  const exceptions = await prisma.paymentException.findMany({
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

  sendSuccess(res, exceptions);
}
