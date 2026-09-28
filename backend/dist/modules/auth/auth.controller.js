"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.logout = logout;
exports.getMe = getMe;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../../config/database");
const env_1 = require("../../config/env");
const response_1 = require("../../utils/response");
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: env_1.env.IS_PRODUCTION,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};
async function login(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        (0, response_1.sendError)(res, 'Email and password are required', 400, 'VALIDATION_ERROR');
        return;
    }
    const user = await database_1.prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
    });
    if (!user) {
        (0, response_1.sendError)(res, 'Invalid credentials', 401, 'INVALID_CREDENTIALS');
        return;
    }
    const isValid = await bcryptjs_1.default.compare(password, user.passwordHash);
    if (!isValid) {
        (0, response_1.sendError)(res, 'Invalid credentials', 401, 'INVALID_CREDENTIALS');
        return;
    }
    const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, env_1.env.JWT_SECRET, { expiresIn: env_1.env.JWT_EXPIRES_IN });
    // Log audit
    await database_1.prisma.auditLog.create({
        data: {
            userId: user.id,
            action: 'LOGIN',
            entityType: 'User',
            entityId: user.id,
        },
    });
    res.cookie('token', token, COOKIE_OPTIONS);
    (0, response_1.sendSuccess)(res, {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
        },
        token,
    });
}
async function logout(req, res) {
    if (req.user) {
        await database_1.prisma.auditLog.create({
            data: {
                userId: req.user.id,
                action: 'LOGOUT',
                entityType: 'User',
                entityId: req.user.id,
            },
        });
    }
    res.clearCookie('token');
    (0, response_1.sendSuccess)(res, { message: 'Logged out successfully' });
}
async function getMe(req, res) {
    if (!req.user) {
        (0, response_1.sendError)(res, 'Not authenticated', 401, 'UNAUTHORIZED');
        return;
    }
    const user = await database_1.prisma.user.findUnique({
        where: { id: req.user.id },
        select: { id: true, name: true, email: true, role: true, avatar: true, createdAt: true },
    });
    if (!user) {
        (0, response_1.sendError)(res, 'User not found', 404, 'USER_NOT_FOUND');
        return;
    }
    (0, response_1.sendSuccess)(res, { user });
}
//# sourceMappingURL=auth.controller.js.map