import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { prisma } from '../../config/database';
import { sendSuccess, sendPaginated, sendError, getPaginationParams } from '../../utils/response';
import { Prisma } from '@prisma/client';

export async function getPolicies(req: AuthRequest, res: Response): Promise<void> {
  const { page, limit, skip } = getPaginationParams(req.query as Record<string, unknown>);
  const { search, type, status, sort = 'createdAt', order = 'desc' } = req.query as Record<string, string>;

  const where: Prisma.PolicyWhereInput = {};

  if (search) {
    where.OR = [
      { policyNumber: { contains: search, mode: 'insensitive' } },
      { policyholder: { name: { contains: search, mode: 'insensitive' } } },
      { policyholder: { customerNumber: { contains: search, mode: 'insensitive' } } },
    ];
  }

  if (type) where.policyType = type as any;
  if (status) where.status = status as any;

  const [total, policies] = await Promise.all([
    prisma.policy.count({ where }),
    prisma.policy.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sort]: order },
      include: {
        policyholder: {
          select: { id: true, name: true, email: true, phone: true, customerNumber: true },
        },
        _count: {
          select: { invoices: true, payments: true, exceptions: true },
        },
      },
    }),
  ]);

  sendPaginated(res, policies, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
}

export async function getPolicyById(req: AuthRequest, res: Response): Promise<void> {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const policy = await prisma.policy.findFirst({
    where: {
      OR: [{ id }, { policyNumber: id }],
    },
    include: {
      policyholder: true,
      billingAccounts: true,
      invoices: {
        orderBy: { dueDate: 'desc' },
        take: 10,
      },
      payments: {
        orderBy: { paymentDate: 'desc' },
        take: 10,
      },
      exceptions: {
        where: { status: { not: 'RESOLVED' } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  });

  if (!policy) {
    sendError(res, `Policy not found: ${id}`, 404, 'POLICY_NOT_FOUND');
    return;
  }

  sendSuccess(res, policy);
}
