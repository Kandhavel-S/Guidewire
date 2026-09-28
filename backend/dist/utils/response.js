"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = sendSuccess;
exports.sendPaginated = sendPaginated;
exports.sendError = sendError;
exports.getPaginationParams = getPaginationParams;
function sendSuccess(res, data, statusCode = 200) {
    res.status(statusCode).json({ success: true, data });
}
function sendPaginated(res, data, pagination) {
    res.status(200).json({ success: true, data, pagination });
}
function sendError(res, message, statusCode = 500, code) {
    res.status(statusCode).json({ success: false, message, code });
}
function getPaginationParams(query) {
    const page = Math.max(1, parseInt(String(query.page || '1'), 10));
    const limit = Math.min(100, Math.max(1, parseInt(String(query.limit || '20'), 10)));
    const skip = (page - 1) * limit;
    return { page, limit, skip };
}
//# sourceMappingURL=response.js.map