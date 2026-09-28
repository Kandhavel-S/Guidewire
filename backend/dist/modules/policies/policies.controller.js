"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPolicies = getPolicies;
exports.getPolicyById = getPolicyById;
const database_1 = require("../../config/database");
const response_1 = require("../../utils/response");
async function getPolicies(req, res) {
    const { page, limit, skip } = (0, response_1.getPaginationParams)(req.query);
    const { search, type, status, sort = 'createdAt', order = 'desc' } = req.query;
    const where = {};
    if (search) {
        where.OR = [
            { policyNumber: { contains: search, mode: 'insensitive' } },
            { policyholder: { name: { contains: search, mode: 'insensitive' } } },
            { policyholder: { customerNumber: { contains: search, mode: 'insensitive' } } },
        ];
    }
    if (type)
        where.policyType = type;
    if (status)
        where.status = status;
    const [total, policies] = await Promise.all([
        database_1.prisma.policy.count({ where }),
        database_1.prisma.policy.findMany({
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
    (0, response_1.sendPaginated)(res, policies, {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
    });
}
async function getPolicyById(req, res) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const policy = await database_1.prisma.policy.findFirst({
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
        (0, response_1.sendError)(res, `Policy not found: ${id}`, 404, 'POLICY_NOT_FOUND');
        return;
    }
    (0, response_1.sendSuccess)(res, policy);
}
//# sourceMappingURL=policies.controller.js.map