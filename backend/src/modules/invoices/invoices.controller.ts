import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { prisma } from '../../config/database';
import { sendSuccess, sendPaginated, sendError, getPaginationParams } from '../../utils/response';
import { Prisma } from '@prisma/client';

export async function getInvoices(req: AuthRequest, res: Response): Promise<void> {
  const { page, limit, skip } = getPaginationParams(req.query as Record<string, unknown>);
  const { search, status, policyId, sort = 'createdAt', order = 'desc' } = req.query as Record<string, string>;

  const where: Prisma.InvoiceWhereInput = {};

  if (search) {
    where.OR = [
      { invoiceNumber: { contains: search, mode: 'insensitive' } },
      { policy: { policyNumber: { contains: search, mode: 'insensitive' } } },
      { policy: { policyholder: { name: { contains: search, mode: 'insensitive' } } } },
    ];
  }

  if (status) where.status = status as any;
  if (policyId) where.policyId = policyId;

  const [total, invoices] = await Promise.all([
    prisma.invoice.count({ where }),
    prisma.invoice.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sort]: order },
      include: {
        policy: {
          include: {
            policyholder: {
              select: { name: true, customerNumber: true },
            },
          },
        },
        payments: {
          where: { status: 'SUCCESS' },
          select: { amount: true, paymentDate: true, paymentMethod: true },
        },
        _count: { select: { exceptions: true } },
      },
    }),
  ]);

  sendPaginated(res, invoices, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
}

export async function getInvoiceById(req: AuthRequest, res: Response): Promise<void> {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const invoice = await prisma.invoice.findFirst({
    where: {
      OR: [{ id }, { invoiceNumber: id }],
    },
    include: {
      policy: {
        include: { policyholder: true },
      },
      billingAccount: true,
      payments: {
        orderBy: { paymentDate: 'desc' },
      },
      exceptions: {
        include: {
          assignedTo: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!invoice) {
    sendError(res, `Invoice not found: ${id}`, 404, 'INVOICE_NOT_FOUND');
    return;
  }

  sendSuccess(res, invoice);
}
