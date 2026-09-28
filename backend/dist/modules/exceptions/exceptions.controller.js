"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExceptions = getExceptions;
exports.getExceptionById = getExceptionById;
exports.updateExceptionStatus = updateExceptionStatus;
exports.assignException = assignException;
exports.addExceptionNote = addExceptionNote;
exports.resolveException = resolveException;
const database_1 = require("../../config/database");
const response_1 = require("../../utils/response");
async function getExceptions(req, res) {
    const { page, limit, skip } = (0, response_1.getPaginationParams)(req.query);
    const { search, type, severity, status, assigneeId, sort = 'createdAt', order = 'desc' } = req.query;
    const where = {};
    if (search) {
        where.OR = [
            { exceptionNumber: { contains: search, mode: 'insensitive' } },
            { policy: { policyNumber: { contains: search, mode: 'insensitive' } } },
            { policy: { policyholder: { name: { contains: search, mode: 'insensitive' } } } },
            { invoice: { invoiceNumber: { contains: search, mode: 'insensitive' } } },
        ];
    }
    if (type)
        where.type = type;
    if (severity)
        where.severity = severity;
    if (status)
        where.status = status;
    if (assigneeId)
        where.assignedToId = assigneeId === 'UNASSIGNED' ? null : assigneeId;
    const [total, exceptions] = await Promise.all([
        database_1.prisma.paymentException.count({ where }),
        database_1.prisma.paymentException.findMany({
            where,
            skip,
            take: limit,
            orderBy: { [sort]: order },
            include: {
                policy: {
                    include: {
                        policyholder: { select: { name: true, customerNumber: true } },
                    },
                },
                invoice: { select: { invoiceNumber: true, dueDate: true } },
                payment: { select: { transactionId: true, paymentMethod: true } },
                assignedTo: { select: { id: true, name: true, email: true } },
                _count: { select: { notes: true, timeline: true } },
            },
        }),
    ]);
    (0, response_1.sendPaginated)(res, exceptions, {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
    });
}
async function getExceptionById(req, res) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const exception = await database_1.prisma.paymentException.findFirst({
        where: {
            OR: [{ id }, { exceptionNumber: id }],
        },
        include: {
            policy: {
                include: { policyholder: true },
            },
            invoice: {
                include: {
                    billingAccount: true,
                },
            },
            payment: true,
            assignedTo: { select: { id: true, name: true, email: true, role: true } },
            notes: {
                include: {
                    user: { select: { id: true, name: true, email: true } },
                },
                orderBy: { createdAt: 'desc' },
            },
            timeline: {
                include: {
                    user: { select: { id: true, name: true } },
                },
                orderBy: { createdAt: 'asc' },
            },
            aiAnalyses: {
                orderBy: { createdAt: 'desc' },
                take: 3,
            },
        },
    });
    if (!exception) {
        (0, response_1.sendError)(res, `Exception not found: ${id}`, 404, 'EXCEPTION_NOT_FOUND');
        return;
    }
    (0, response_1.sendSuccess)(res, exception);
}
async function updateExceptionStatus(req, res) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { status } = req.body;
    if (!status) {
        (0, response_1.sendError)(res, 'Status is required', 400, 'VALIDATION_ERROR');
        return;
    }
    const validStatuses = ['OPEN', 'INVESTIGATING', 'RESOLVED', 'ESCALATED'];
    if (!validStatuses.includes(status)) {
        (0, response_1.sendError)(res, `Invalid status: ${status}`, 400, 'INVALID_STATUS');
        return;
    }
    const exception = await database_1.prisma.paymentException.findFirst({
        where: { OR: [{ id }, { exceptionNumber: id }] },
    });
    if (!exception) {
        (0, response_1.sendError)(res, 'Exception not found', 404, 'EXCEPTION_NOT_FOUND');
        return;
    }
    const updated = await database_1.prisma.$transaction(async (tx) => {
        const exc = await tx.paymentException.update({
            where: { id: exception.id },
            data: {
                status: status,
                resolvedAt: status === 'RESOLVED' ? new Date() : undefined,
            },
        });
        await tx.exceptionTimelineEvent.create({
            data: {
                exceptionId: exception.id,
                userId: req.user?.id,
                eventType: 'STATUS_CHANGED',
                description: `Status changed to ${status}`,
            },
        });
        await tx.auditLog.create({
            data: {
                userId: req.user?.id,
                action: 'UPDATE_EXCEPTION',
                entityType: 'PaymentException',
                entityId: exception.id,
                oldValue: { status: exception.status },
                newValue: { status },
            },
        });
        return exc;
    });
    (0, response_1.sendSuccess)(res, updated);
}
async function assignException(req, res) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { assignedToId } = req.body;
    const exception = await database_1.prisma.paymentException.findFirst({
        where: { OR: [{ id }, { exceptionNumber: id }] },
    });
    if (!exception) {
        (0, response_1.sendError)(res, 'Exception not found', 404, 'EXCEPTION_NOT_FOUND');
        return;
    }
    // Verify assignee exists if provided
    if (assignedToId) {
        const assignee = await database_1.prisma.user.findUnique({ where: { id: assignedToId } });
        if (!assignee) {
            (0, response_1.sendError)(res, 'Assignee user not found', 404, 'USER_NOT_FOUND');
            return;
        }
    }
    const updated = await database_1.prisma.$transaction(async (tx) => {
        const exc = await tx.paymentException.update({
            where: { id: exception.id },
            data: { assignedToId: assignedToId || null },
            include: {
                assignedTo: { select: { id: true, name: true } },
            },
        });
        const assigneeName = exc.assignedTo?.name || 'Unassigned';
        await tx.exceptionTimelineEvent.create({
            data: {
                exceptionId: exception.id,
                userId: req.user?.id,
                eventType: 'ASSIGNED',
                description: `Case assigned to ${assigneeName}`,
            },
        });
        await tx.auditLog.create({
            data: {
                userId: req.user?.id,
                action: 'ASSIGN_EXCEPTION',
                entityType: 'PaymentException',
                entityId: exception.id,
                newValue: { assignedToId, assigneeName },
            },
        });
        return exc;
    });
    (0, response_1.sendSuccess)(res, updated);
}
async function addExceptionNote(req, res) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { content } = req.body;
    if (!content?.trim()) {
        (0, response_1.sendError)(res, 'Note content is required', 400, 'VALIDATION_ERROR');
        return;
    }
    const exception = await database_1.prisma.paymentException.findFirst({
        where: { OR: [{ id }, { exceptionNumber: id }] },
    });
    if (!exception) {
        (0, response_1.sendError)(res, 'Exception not found', 404, 'EXCEPTION_NOT_FOUND');
        return;
    }
    const note = await database_1.prisma.$transaction(async (tx) => {
        const newNote = await tx.exceptionNote.create({
            data: {
                exceptionId: exception.id,
                userId: req.user.id,
                content: content.trim(),
            },
            include: {
                user: { select: { id: true, name: true, email: true } },
            },
        });
        await tx.exceptionTimelineEvent.create({
            data: {
                exceptionId: exception.id,
                userId: req.user?.id,
                eventType: 'NOTE_ADDED',
                description: content.trim().length > 80 ? `${content.trim().slice(0, 80)}...` : content.trim(),
            },
        });
        await tx.auditLog.create({
            data: {
                userId: req.user?.id,
                action: 'ADD_NOTE',
                entityType: 'PaymentException',
                entityId: exception.id,
                newValue: { noteId: newNote.id },
            },
        });
        return newNote;
    });
    (0, response_1.sendSuccess)(res, note, 201);
}
async function resolveException(req, res) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { note } = req.body;
    const exception = await database_1.prisma.paymentException.findFirst({
        where: { OR: [{ id }, { exceptionNumber: id }] },
    });
    if (!exception) {
        (0, response_1.sendError)(res, 'Exception not found', 404, 'EXCEPTION_NOT_FOUND');
        return;
    }
    if (exception.status === 'RESOLVED') {
        (0, response_1.sendError)(res, 'Exception is already resolved', 409, 'ALREADY_RESOLVED');
        return;
    }
    const updated = await database_1.prisma.$transaction(async (tx) => {
        const exc = await tx.paymentException.update({
            where: { id: exception.id },
            data: {
                status: 'RESOLVED',
                resolvedAt: new Date(),
            },
        });
        if (note?.trim()) {
            await tx.exceptionNote.create({
                data: {
                    exceptionId: exception.id,
                    userId: req.user.id,
                    content: `[Resolution Note] ${note.trim()}`,
                },
            });
        }
        await tx.exceptionTimelineEvent.create({
            data: {
                exceptionId: exception.id,
                userId: req.user?.id,
                eventType: 'RESOLVED',
                description: note?.trim() || 'Case marked as resolved after investigation.',
            },
        });
        await tx.auditLog.create({
            data: {
                userId: req.user?.id,
                action: 'RESOLVE_EXCEPTION',
                entityType: 'PaymentException',
                entityId: exception.id,
                newValue: { resolvedAt: exc.resolvedAt },
            },
        });
        return exc;
    });
    (0, response_1.sendSuccess)(res, updated);
}
//# sourceMappingURL=exceptions.controller.js.map