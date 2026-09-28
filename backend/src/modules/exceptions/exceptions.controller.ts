import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { prisma } from '../../config/database';
import { sendSuccess, sendPaginated, sendError, getPaginationParams } from '../../utils/response';
import { Prisma } from '@prisma/client';

export async function getExceptions(req: AuthRequest, res: Response): Promise<void> {
  const { page, limit, skip } = getPaginationParams(req.query as Record<string, unknown>);
  const { search, type, severity, status, assigneeId, sort = 'createdAt', order = 'desc' } =
    req.query as Record<string, string>;

  const where: Prisma.PaymentExceptionWhereInput = {};

  if (search) {
    where.OR = [
      { exceptionNumber: { contains: search, mode: 'insensitive' } },
      { policy: { policyNumber: { contains: search, mode: 'insensitive' } } },
      { policy: { policyholder: { name: { contains: search, mode: 'insensitive' } } } },
      { invoice: { invoiceNumber: { contains: search, mode: 'insensitive' } } },
    ];
  }

  if (type) where.type = type as any;
  if (severity) where.severity = severity as any;
  if (status) where.status = status as any;
  if (assigneeId) where.assignedToId = assigneeId === 'UNASSIGNED' ? null : assigneeId;

  const [total, exceptions] = await Promise.all([
    prisma.paymentException.count({ where }),
    prisma.paymentException.findMany({
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

  sendPaginated(res, exceptions, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
}

export async function getExceptionById(req: AuthRequest, res: Response): Promise<void> {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const exception = await prisma.paymentException.findFirst({
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
    sendError(res, `Exception not found: ${id}`, 404, 'EXCEPTION_NOT_FOUND');
    return;
  }

  sendSuccess(res, exception);
}

export async function updateExceptionStatus(req: AuthRequest, res: Response): Promise<void> {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { status } = req.body;

  if (!status) {
    sendError(res, 'Status is required', 400, 'VALIDATION_ERROR');
    return;
  }

  const validStatuses = ['OPEN', 'INVESTIGATING', 'RESOLVED', 'ESCALATED'];
  if (!validStatuses.includes(status)) {
    sendError(res, `Invalid status: ${status}`, 400, 'INVALID_STATUS');
    return;
  }

  const exception = await prisma.paymentException.findFirst({
    where: { OR: [{ id }, { exceptionNumber: id }] },
  });

  if (!exception) {
    sendError(res, 'Exception not found', 404, 'EXCEPTION_NOT_FOUND');
    return;
  }

  const updated = await prisma.$transaction(async (tx: any) => {
    const exc = await tx.paymentException.update({
      where: { id: exception.id },
      data: {
        status: status as any,
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

  sendSuccess(res, updated);
}

export async function assignException(req: AuthRequest, res: Response): Promise<void> {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { assignedToId } = req.body;

  const exception = await prisma.paymentException.findFirst({
    where: { OR: [{ id }, { exceptionNumber: id }] },
  });

  if (!exception) {
    sendError(res, 'Exception not found', 404, 'EXCEPTION_NOT_FOUND');
    return;
  }

  // Verify assignee exists if provided
  if (assignedToId) {
    const assignee = await prisma.user.findUnique({ where: { id: assignedToId } });
    if (!assignee) {
      sendError(res, 'Assignee user not found', 404, 'USER_NOT_FOUND');
      return;
    }
  }

  const updated = await prisma.$transaction(async (tx: any) => {
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

  sendSuccess(res, updated);
}

export async function addExceptionNote(req: AuthRequest, res: Response): Promise<void> {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { content } = req.body;

  if (!content?.trim()) {
    sendError(res, 'Note content is required', 400, 'VALIDATION_ERROR');
    return;
  }

  const exception = await prisma.paymentException.findFirst({
    where: { OR: [{ id }, { exceptionNumber: id }] },
  });

  if (!exception) {
    sendError(res, 'Exception not found', 404, 'EXCEPTION_NOT_FOUND');
    return;
  }

  const note = await prisma.$transaction(async (tx: any) => {
    const newNote = await tx.exceptionNote.create({
      data: {
        exceptionId: exception.id,
        userId: req.user!.id,
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
        description:
          content.trim().length > 80 ? `${content.trim().slice(0, 80)}...` : content.trim(),
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

  sendSuccess(res, note, 201);
}

export async function resolveException(req: AuthRequest, res: Response): Promise<void> {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { note } = req.body;

  const exception = await prisma.paymentException.findFirst({
    where: { OR: [{ id }, { exceptionNumber: id }] },
  });

  if (!exception) {
    sendError(res, 'Exception not found', 404, 'EXCEPTION_NOT_FOUND');
    return;
  }

  if (exception.status === 'RESOLVED') {
    sendError(res, 'Exception is already resolved', 409, 'ALREADY_RESOLVED');
    return;
  }

  const updated = await prisma.$transaction(async (tx: any) => {
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
          userId: req.user!.id,
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

  sendSuccess(res, updated);
}
