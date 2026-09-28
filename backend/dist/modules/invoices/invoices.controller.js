"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInvoices = getInvoices;
exports.getInvoiceById = getInvoiceById;
const database_1 = require("../../config/database");
const response_1 = require("../../utils/response");
async function getInvoices(req, res) {
    const { page, limit, skip } = (0, response_1.getPaginationParams)(req.query);
    const { search, status, policyId, sort = 'createdAt', order = 'desc' } = req.query;
    const where = {};
    if (search) {
        where.OR = [
            { invoiceNumber: { contains: search, mode: 'insensitive' } },
            { policy: { policyNumber: { contains: search, mode: 'insensitive' } } },
            { policy: { policyholder: { name: { contains: search, mode: 'insensitive' } } } },
        ];
    }
    if (status)
        where.status = status;
    if (policyId)
        where.policyId = policyId;
    const [total, invoices] = await Promise.all([
        database_1.prisma.invoice.count({ where }),
        database_1.prisma.invoice.findMany({
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
    (0, response_1.sendPaginated)(res, invoices, {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
    });
}
async function getInvoiceById(req, res) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const invoice = await database_1.prisma.invoice.findFirst({
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
        (0, response_1.sendError)(res, `Invoice not found: ${id}`, 404, 'INVOICE_NOT_FOUND');
        return;
    }
    (0, response_1.sendSuccess)(res, invoice);
}
//# sourceMappingURL=invoices.controller.js.map