import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { prisma } from '../../config/database';
import { sendSuccess, sendPaginated, sendError, getPaginationParams } from '../../utils/response';
import { Prisma } from '@prisma/client';

export async function getPayments(req: AuthRequest, res: Response): Promise<void> {
  const { page, limit, skip } = getPaginationParams(req.query as Record<string, unknown>);
  const { search, status, paymentMethod, policyId, invoiceId } = req.query as Record<string, string>;

  const where: Prisma.PaymentWhereInput = {};

  if (search) {
    where.OR = [
      { transactionId: { contains: search, mode: 'insensitive' } },
      { referenceNumber: { contains: search, mode: 'insensitive' } },
      { policy: { policyNumber: { contains: search, mode: 'insensitive' } } },
      { policy: { policyholder: { name: { contains: search, mode: 'insensitive' } } } },
    ];
  }

  if (status) where.status = status as any;
  if (paymentMethod) where.paymentMethod = paymentMethod as any;
  if (policyId) where.policyId = policyId;
  if (invoiceId) where.invoiceId = invoiceId;

  const [total, payments] = await Promise.all([
    prisma.payment.count({ where }),
    prisma.payment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { paymentDate: 'desc' },
      include: {
        policy: {
          include: {
            policyholder: {
              select: { name: true, customerNumber: true },
            },
          },
        },
        invoice: {
          select: { invoiceNumber: true, totalAmount: true },
        },
      },
    }),
  ]);

  sendPaginated(res, payments, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
}

export async function getPaymentById(req: AuthRequest, res: Response): Promise<void> {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const payment = await prisma.payment.findFirst({
    where: {
      OR: [{ id }, { transactionId: id }],
    },
    include: {
      policy: {
        include: { policyholder: true },
      },
      invoice: {
        include: { billingAccount: true },
      },
      exceptions: {
        select: { id: true, exceptionNumber: true, type: true, status: true, severity: true },
      },
    },
  });

  if (!payment) {
    sendError(res, `Payment not found: ${id}`, 404, 'PAYMENT_NOT_FOUND');
    return;
  }

  sendSuccess(res, payment);
}
