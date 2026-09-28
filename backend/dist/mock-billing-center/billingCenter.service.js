"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.billingCenterService = void 0;
const database_1 = require("../config/database");
/**
 * Mock Guidewire BillingCenter Service
 * Abstracts database access as if it were BillingCenter API calls.
 * In production, these would be real Guidewire REST API calls.
 */
exports.billingCenterService = {
    async getPolicies(params) {
        const { page, limit, search, type, status } = params;
        const skip = (page - 1) * limit;
        const where = {};
        if (type)
            where.policyType = type;
        if (status)
            where.status = status;
        if (search) {
            where.OR = [
                { policyNumber: { contains: search, mode: 'insensitive' } },
                { policyholder: { name: { contains: search, mode: 'insensitive' } } },
            ];
        }
        const [total, policies] = await Promise.all([
            database_1.prisma.policy.count({ where }),
            database_1.prisma.policy.findMany({
                where,
                skip,
                take: limit,
                include: { policyholder: true },
            }),
        ]);
        return { policies, total, page, limit };
    },
    async getPolicyById(id) {
        return database_1.prisma.policy.findFirst({
            where: { OR: [{ id }, { policyNumber: id }] },
            include: {
                policyholder: true,
                billingAccounts: true,
            },
        });
    },
    async getInvoices(params) {
        const { page, limit, policyId, status } = params;
        const skip = (page - 1) * limit;
        const where = {};
        if (policyId)
            where.policyId = policyId;
        if (status)
            where.status = status;
        const [total, invoices] = await Promise.all([
            database_1.prisma.invoice.count({ where }),
            database_1.prisma.invoice.findMany({
                where,
                skip,
                take: limit,
                include: { policy: { include: { policyholder: true } } },
            }),
        ]);
        return { invoices, total, page, limit };
    },
    async getInvoiceById(id) {
        return database_1.prisma.invoice.findFirst({
            where: { OR: [{ id }, { invoiceNumber: id }] },
            include: {
                policy: { include: { policyholder: true } },
                payments: true,
            },
        });
    },
    async getPayments(params) {
        const { page, limit, invoiceId, status } = params;
        const skip = (page - 1) * limit;
        const where = {};
        if (invoiceId)
            where.invoiceId = invoiceId;
        if (status)
            where.status = status;
        const [total, payments] = await Promise.all([
            database_1.prisma.payment.count({ where }),
            database_1.prisma.payment.findMany({
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
    async getPaymentById(id) {
        return database_1.prisma.payment.findFirst({
            where: { OR: [{ id }, { transactionId: id }] },
            include: {
                policy: { include: { policyholder: true } },
                invoice: true,
            },
        });
    },
    async getAccounts(params) {
        const { page, limit, policyId } = params;
        const skip = (page - 1) * limit;
        const where = {};
        if (policyId)
            where.policyId = policyId;
        const [total, accounts] = await Promise.all([
            database_1.prisma.billingAccount.count({ where }),
            database_1.prisma.billingAccount.findMany({
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
    async getAccountById(id) {
        return database_1.prisma.billingAccount.findFirst({
            where: { OR: [{ id }, { accountNumber: id }] },
            include: {
                policyholder: true,
                policy: true,
                invoices: { orderBy: { dueDate: 'desc' }, take: 10 },
            },
        });
    },
};
//# sourceMappingURL=billingCenter.service.js.map