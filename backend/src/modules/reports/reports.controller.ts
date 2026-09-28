import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { prisma } from '../../config/database';
import { sendSuccess } from '../../utils/response';

// Helper: convert array to CSV string
function arrayToCSV(data: Record<string, unknown>[]): string {
  if (data.length === 0) return '';
  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers.map((h) => {
      const val = row[h];
      const str = val === null || val === undefined ? '' : String(val);
      return str.includes(',') ? `"${str}"` : str;
    }).join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}

export async function getReconciliationReport(_req: AuthRequest, res: Response): Promise<void> {
  const [runs, invoiceStats] = await Promise.all([
    prisma.reconciliationRun.findMany({
      orderBy: { startedAt: 'desc' },
      take: 20,
    }),
    prisma.invoice.groupBy({
      by: ['status'],
      _count: { _all: true },
      _sum: { totalAmount: true },
    }),
  ]);

  sendSuccess(res, { runs, invoiceStats });
}

export async function getExceptionsReport(_req: AuthRequest, res: Response): Promise<void> {
  const [byType, bySeverity, byStatus, recent] = await Promise.all([
    prisma.paymentException.groupBy({
      by: ['type'],
      _count: { _all: true },
      _sum: { difference: true },
    }),
    prisma.paymentException.groupBy({
      by: ['severity'],
      _count: { _all: true },
    }),
    prisma.paymentException.groupBy({
      by: ['status'],
      _count: { _all: true },
    }),
    prisma.paymentException.findMany({
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

  sendSuccess(res, { byType, bySeverity, byStatus, recent });
}

export async function getPaymentsReport(_req: AuthRequest, res: Response): Promise<void> {
  const [byStatus, byMethod, recentFailed] = await Promise.all([
    prisma.payment.groupBy({
      by: ['status'],
      _count: { _all: true },
      _sum: { amount: true },
    }),
    prisma.payment.groupBy({
      by: ['paymentMethod'],
      _count: { _all: true },
      _sum: { amount: true },
    }),
    prisma.payment.findMany({
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

  sendSuccess(res, { byStatus, byMethod, recentFailed });
}

// CSV EXPORTS

export async function exportExceptionsCSV(_req: AuthRequest, res: Response): Promise<void> {
  const exceptions = await prisma.paymentException.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      policy: {
        include: { policyholder: { select: { name: true } } },
      },
      invoice: { select: { invoiceNumber: true } },
      assignedTo: { select: { name: true } },
    },
  });

  const csvData = exceptions.map((e: any) => ({
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

  const csv = arrayToCSV(csvData as Record<string, unknown>[]);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="insureflow_exceptions.csv"');
  res.send(csv);
}

export async function exportReconciliationCSV(_req: AuthRequest, res: Response): Promise<void> {
  const latestRun = await prisma.reconciliationRun.findFirst({
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

  const csvData = latestRun.records.map((r: any) => ({
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

  const csv = arrayToCSV(csvData as Record<string, unknown>[]);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="insureflow_reconciliation.csv"');
  res.send(csv);
}

export async function exportPaymentsCSV(_req: AuthRequest, res: Response): Promise<void> {
  const payments = await prisma.payment.findMany({
    orderBy: { paymentDate: 'desc' },
    include: {
      policy: {
        include: { policyholder: { select: { name: true } } },
      },
      invoice: { select: { invoiceNumber: true } },
    },
  });

  const csvData = payments.map((p: any) => ({
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

  const csv = arrayToCSV(csvData as Record<string, unknown>[]);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="insureflow_payments.csv"');
  res.send(csv);
}
