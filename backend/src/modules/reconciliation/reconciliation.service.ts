import { prisma } from '../../config/database';
import { Decimal } from '@prisma/client/runtime/library';

interface ReconciliationResult {
  runId: string;
  recordsProcessed: number;
  matchedRecords: number;
  exceptionRecords: number;
  totalExpectedAmount: Decimal;
  totalReceivedAmount: Decimal;
  totalDifference: Decimal;
}

export async function runReconciliationEngine(
  runId: string,
  emitter?: (event: string, data: unknown) => void
): Promise<ReconciliationResult> {
  const notify = (msg: string) => {
    console.log(`[Reconciliation] ${msg}`);
    emitter?.('reconciliation:step', { message: msg });
  };

  notify('Fetching all active invoices from BillingCenter...');

  // Fetch all invoices that need reconciliation (not cancelled)
  const invoices = await prisma.invoice.findMany({
    where: {
      status: { not: 'CANCELLED' },
    },
    include: {
      policy: {
        include: { policyholder: true },
      },
      payments: {
        where: { status: { in: ['SUCCESS', 'FAILED', 'REFUNDED'] } },
        orderBy: { paymentDate: 'asc' },
      },
    },
  });

  notify(`Processing ${invoices.length} invoices...`);

  let matchedRecords = 0;
  let exceptionRecords = 0;
  let totalExpectedAmount = new Decimal(0);
  let totalReceivedAmount = new Decimal(0);

  for (const invoice of invoices) {
    const expectedAmount = invoice.totalAmount;
    totalExpectedAmount = totalExpectedAmount.add(expectedAmount);

    const successfulPayments = invoice.payments.filter((p: any) => p.status === 'SUCCESS');
    const failedPayments = invoice.payments.filter((p: any) => p.status === 'FAILED');

    const actualAmount = successfulPayments.reduce(
      (sum: Decimal, p: any) => sum.add(p.amount),
      new Decimal(0)
    );
    totalReceivedAmount = totalReceivedAmount.add(actualAmount);

    const difference = actualAmount.minus(expectedAmount);

    let reconciliationStatus: string;
    let exceptionType: string | null = null;

    // Check for duplicate payments (same reference in same timeframe)
    const transactionIds = successfulPayments.map((p: any) => p.referenceNumber).filter(Boolean);
    const hasDuplicate =
      transactionIds.length !== new Set(transactionIds).size && successfulPayments.length > 1;

    if (hasDuplicate) {
      reconciliationStatus = 'DUPLICATE_PAYMENT';
      exceptionType = 'DUPLICATE_PAYMENT';
    } else if (successfulPayments.length === 0 && failedPayments.length > 0) {
      reconciliationStatus = 'PAYMENT_FAILED';
      exceptionType = 'PAYMENT_FAILED';
    } else if (successfulPayments.length === 0) {
      reconciliationStatus = 'MISSING_PAYMENT';
      exceptionType = 'MISSING_PAYMENT';
    } else if (difference.abs().lessThan(new Decimal('0.01'))) {
      // Check if late payment
      const isLate = successfulPayments.some(
        (p: any) => new Date(p.paymentDate) > new Date(invoice.dueDate)
      );
      reconciliationStatus = isLate ? 'LATE_PAYMENT' : 'MATCHED';
      if (isLate) exceptionType = 'LATE_PAYMENT';
    } else if (difference.lessThan(0)) {
      reconciliationStatus = 'UNDERPAYMENT';
      exceptionType = 'UNDERPAYMENT';
    } else {
      reconciliationStatus = 'OVERPAYMENT';
      exceptionType = 'OVERPAYMENT';
    }

    const latestPayment = successfulPayments[successfulPayments.length - 1];

    // Create reconciliation record
    const reconRecord = await prisma.reconciliationRecord.create({
      data: {
        runId,
        invoiceId: invoice.id,
        policyId: invoice.policyId,
        paymentId: latestPayment?.id || null,
        expectedAmount,
        actualAmount,
        difference: difference.abs(),
        status: reconciliationStatus as any,
      },
    });

    if (reconciliationStatus === 'MATCHED') {
      matchedRecords++;

      // Update invoice status to PAID if not already
      if (invoice.status !== 'PAID') {
        await prisma.invoice.update({
          where: { id: invoice.id },
          data: { status: 'PAID' },
        });
      }
    } else {
      exceptionRecords++;

      // Check if unresolved exception already exists for this invoice+type
      const existingException = await prisma.paymentException.findFirst({
        where: {
          invoiceId: invoice.id,
          type: exceptionType as any,
          status: { not: 'RESOLVED' as any },
        },
      });

      if (existingException) {
        // Update existing exception, link to new reconciliation record
        await prisma.reconciliationRecord.update({
          where: { id: reconRecord.id },
          data: { exceptionId: existingException.id },
        });

        // Add a timeline event about re-detection
        await prisma.exceptionTimelineEvent.create({
          data: {
            exceptionId: existingException.id,
            eventType: 'STATUS_CHANGED',
            description: `Re-detected in reconciliation run. Amount difference: ₹${difference.abs().toFixed(2)}`,
          },
        });
      } else if (exceptionType) {
        // Determine severity based on difference amount
        const diffAbs = difference.abs();
        let severity: string;
        if (diffAbs.greaterThanOrEqualTo(new Decimal('50000'))) {
          severity = 'CRITICAL';
        } else if (diffAbs.greaterThanOrEqualTo(new Decimal('10000'))) {
          severity = 'HIGH';
        } else if (diffAbs.greaterThanOrEqualTo(new Decimal('1000'))) {
          severity = 'MEDIUM';
        } else {
          severity = 'LOW';
        }

        // For MISSING_PAYMENT, use the expected amount
        const finalDiff = reconciliationStatus === 'MISSING_PAYMENT' ? expectedAmount : difference.abs();

        // Create new exception
        const exceptionCount = await prisma.paymentException.count();
        const exceptionNumber = `EXC-${String(exceptionCount + 1).padStart(5, '0')}`;

        const newException = await prisma.paymentException.create({
          data: {
            exceptionNumber,
            invoiceId: invoice.id,
            paymentId: latestPayment?.id || null,
            policyId: invoice.policyId,
            type: exceptionType as any,
            expectedAmount,
            actualAmount,
            difference: finalDiff,
            severity: severity as any,
            status: 'OPEN',
            description: generateExceptionDescription(exceptionType, expectedAmount, actualAmount, difference),
          },
        });

        // Update reconciliation record with exception ID
        await prisma.reconciliationRecord.update({
          where: { id: reconRecord.id },
          data: { exceptionId: newException.id },
        });

        // Create timeline event
        await prisma.exceptionTimelineEvent.create({
          data: {
            exceptionId: newException.id,
            eventType: 'CREATED',
            description: `Exception auto-generated by reconciliation engine. Type: ${exceptionType}`,
          },
        });

        // Update invoice status
        const newStatus = getInvoiceStatus(reconciliationStatus);
        await prisma.invoice.update({
          where: { id: invoice.id },
          data: { status: newStatus as any },
        });
      }
    }
  }

  notify('Reconciliation completed!');

  return {
    runId,
    recordsProcessed: invoices.length,
    matchedRecords,
    exceptionRecords,
    totalExpectedAmount,
    totalReceivedAmount,
    totalDifference: totalExpectedAmount.minus(totalReceivedAmount).abs(),
  };
}

function generateExceptionDescription(
  type: string,
  expected: Decimal,
  actual: Decimal,
  difference: Decimal
): string {
  switch (type) {
    case 'UNDERPAYMENT':
      return `Payment of ₹${actual.toFixed(2)} received against expected ₹${expected.toFixed(2)}. Shortfall: ₹${difference.abs().toFixed(2)}`;
    case 'OVERPAYMENT':
      return `Payment of ₹${actual.toFixed(2)} exceeds expected ₹${expected.toFixed(2)}. Surplus: ₹${difference.abs().toFixed(2)}`;
    case 'MISSING_PAYMENT':
      return `No successful payment recorded. Full amount of ₹${expected.toFixed(2)} outstanding.`;
    case 'DUPLICATE_PAYMENT':
      return `Duplicate payment reference detected. Total received: ₹${actual.toFixed(2)}, Expected: ₹${expected.toFixed(2)}`;
    case 'LATE_PAYMENT':
      return `Payment of ₹${actual.toFixed(2)} received after invoice due date.`;
    case 'PAYMENT_FAILED':
      return `Payment gateway failure. No successful transaction. Amount due: ₹${expected.toFixed(2)}`;
    default:
      return `Payment discrepancy detected.`;
  }
}

function getInvoiceStatus(reconciliationStatus: string): any {
  switch (reconciliationStatus) {
    case 'UNDERPAYMENT':
      return 'PARTIALLY_PAID';
    case 'OVERPAYMENT':
      return 'OVERPAID';
    case 'LATE_PAYMENT':
      return 'PAID';
    default:
      return 'UNPAID';
  }
}
