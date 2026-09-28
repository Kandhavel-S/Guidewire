"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
exports.createError = createError;
exports.notFoundHandler = notFoundHandler;
const env_1 = require("../config/env");
function errorHandler(err, _req, res, _next) {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    console.error(`[ERROR] ${statusCode} — ${message}`, {
        code: err.code,
        stack: env_1.env.IS_PRODUCTION ? undefined : err.stack,
    });
    res.status(statusCode).json({
        success: false,
        message,
        code: err.code || 'INTERNAL_ERROR',
        ...(env_1.env.IS_PRODUCTION ? {} : { stack: err.stack }),
    });
}
function createError(message, statusCode, code) {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.code = code;
    return error;
}
function notFoundHandler(req, res) {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.path}`,
        code: 'NOT_FOUND',
    });
}
//# sourceMappingURL=errorHandler.js.map