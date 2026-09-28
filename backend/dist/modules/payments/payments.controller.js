"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPayments = getPayments;
exports.getPaymentById = getPaymentById;
const database_1 = require("../../config/database");
const response_1 = require("../../utils/response");
async function getPayments(req, res) {
    const { page, limit, skip } = (0, response_1.getPaginationParams)(req.query);
    const { search, status, paymentMethod, policyId, invoiceId } = req.query;
    const where = {};
    if (search) {
        where.OR = [
            { transactionId: { contains: search, mode: 'insensitive' } },
            { referenceNumber: { contains: search, mode: 'insensitive' } },
            { policy: { policyNumber: { contains: search, mode: 'insensitive' } } },
            { policy: { policyholder: { name: { contains: search, mode: 'insensitive' } } } },
        ];
    }
    if (status)
        where.status = status;
    if (paymentMethod)
        where.paymentMethod = paymentMethod;
    if (policyId)
        where.policyId = policyId;
    if (invoiceId)
        where.invoiceId = invoiceId;
    const [total, payments] = await Promise.all([
        database_1.prisma.payment.count({ where }),
        database_1.prisma.payment.findMany({
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
    (0, response_1.sendPaginated)(res, payments, {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
    });
}
async function getPaymentById(req, res) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const payment = await database_1.prisma.payment.findFirst({
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
        (0, response_1.sendError)(res, `Payment not found: ${id}`, 404, 'PAYMENT_NOT_FOUND');
        return;
    }
    (0, response_1.sendSuccess)(res, payment);
}
//# sourceMappingURL=payments.controller.js.map