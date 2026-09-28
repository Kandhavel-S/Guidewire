"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const database_1 = require("../config/database");
async function requireAuth(req, res, next) {
    try {
        // Check cookie first, then Authorization header
        let token;
        if (req.cookies?.token) {
            token = req.cookies.token;
        }
        else if (req.headers.authorization?.startsWith('Bearer ')) {
            token = req.headers.authorization.slice(7);
        }
        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
                code: 'UNAUTHORIZED',
            });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        // Verify user still exists in DB
        const user = await database_1.prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, email: true, role: true, name: true },
        });
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'User not found',
                code: 'USER_NOT_FOUND',
            });
            return;
        }
        req.user = user;
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid or expired token',
            code: 'INVALID_TOKEN',
        });
    }
}
//# sourceMappingURL=auth.js.map