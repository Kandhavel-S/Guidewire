"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = requireRole;
exports.requireMinRole = requireMinRole;
// Role hierarchy: ADMIN > FINANCE_ANALYST > OPERATIONS_USER > VIEWER
const ROLE_LEVELS = {
    ADMIN: 4,
    FINANCE_ANALYST: 3,
    OPERATIONS_USER: 2,
    VIEWER: 1,
};
function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
                code: 'UNAUTHORIZED',
            });
            return;
        }
        const userRole = req.user.role;
        const hasPermission = roles.some((role) => {
            // User must have at least the required role level
            return ROLE_LEVELS[userRole] >= ROLE_LEVELS[role];
        });
        if (!hasPermission) {
            res.status(403).json({
                success: false,
                message: 'Insufficient permissions',
                code: 'FORBIDDEN',
                required: roles,
                current: userRole,
            });
            return;
        }
        next();
    };
}
function requireMinRole(minRole) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }
        const userRole = req.user.role;
        if (ROLE_LEVELS[userRole] < ROLE_LEVELS[minRole]) {
            res.status(403).json({
                success: false,
                message: 'Insufficient permissions',
                code: 'FORBIDDEN',
            });
            return;
        }
        next();
    };
}
//# sourceMappingURL=rbac.js.map