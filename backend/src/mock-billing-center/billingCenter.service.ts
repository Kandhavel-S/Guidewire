import { prisma } from '../config/database';

/**
 * Mock Guidewire BillingCenter Service
 * Abstracts database access as if it were BillingCenter API calls.
 * In production, these would be real Guidewire REST API calls.
 */
export const billingCenterService = {
  async getPolicies(params: {
    page: number;
    limit: number;
    search?: string;
    type?: string;
    status?: string;
  }) {
    const { page, limit, search, type, status } = params;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (type) where.policyType = type;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { policyNumber: { contains: search, mode: 'insensitive' } },
        { policyholder: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [total, policies] = await Promise.all([
      prisma.policy.count({ where }),
      prisma.policy.findMany({
        where,
        skip,
        take: limit,
        include: { policyholder: true },
      }),
    ]);

    return { policies, total, page, limit };
  },

  async getPolicyById(id: string) {
    return prisma.policy.findFirst({
      where: { OR: [{ id }, { policyNumber: id }] },
      include: {
        policyholder: true,
        billingAccounts: true,
      },
    });
  },

  async getInvoices(params: {
    page: number;
    limit: number;
    policyId?: string;
    status?: string;
  }) {
    const { page, limit, policyId, status } = params;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (policyId) where.policyId = policyId;
    if (status) where.status = status;

    const [total, invoices] = await Promise.all([
      prisma.invoice.count({ where }),
      prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        include: { policy: { include: { policyholder: true } } },
      }),
    ]);

    return { invoices, total, page, limit };
  },

  async getInvoiceById(id: string) {
    return prisma.invoice.findFirst({
      where: { OR: [{ id }, { invoiceNumber: id }] },
      include: {
        policy: { include: { policyholder: true } },
        payments: true,
      },
    });
  },

  async getPayments(params: {
    page: number;
    limit: number;
    invoiceId?: string;
    status?: string;
  }) {
    const { page, limit, invoiceId, status } = params;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (invoiceId) where.invoiceId = invoiceId;
    if (status) where.status = status;

    const [total, payments] = await Promise.all([
      prisma.payment.count({ where }),
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        include: {
          invoice: { select: { invoiceNumber: true } },
          policy: { include: { policyholder: true } },
        },
      }),
    ]);

    return { payments, total, page, limit };
  },

  async getPaymentById(id: string) {
    return prisma.payment.findFirst({
      where: { OR: [{ id }, { transactionId: id }] },
      include: {
        policy: { include: { policyholder: true } },
        invoice: true,
      },
    });
  },

  async getAccounts(params: { page: number; limit: number; policyId?: string }) {
    const { page, limit, policyId } = params;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (policyId) where.policyId = policyId;

    const [total, accounts] = await Promise.all([
      prisma.billingAccount.count({ where }),
      prisma.billingAccount.findMany({
        where,
        skip,
        take: limit,
        include: {
          policyholder: { select: { name: true, customerNumber: true } },
          policy: { select: { policyNumber: true, policyType: true } },
        },
      }),
    ]);

    return { accounts, total, page, limit };
  },

  async getAccountById(id: string) {
    return prisma.billingAccount.findFirst({
      where: { OR: [{ id }, { accountNumber: id }] },
      include: {
        policyholder: true,
        policy: true,
        invoices: { orderBy: { dueDate: 'desc' }, take: 10 },
      },
    });
  },
};
