"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPredictions = listPredictions;
exports.listExceptionPredictions = listExceptionPredictions;
const response_1 = require("../../utils/response");
const ml_service_1 = require("./ml.service");
async function listPredictions(_req, res) {
    (0, response_1.sendSuccess)(res, await (0, ml_service_1.getPredictions)());
}
async function listExceptionPredictions(req, res) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
        (0, response_1.sendError)(res, 'Exception ID is required', 400, 'VALIDATION_ERROR');
        return;
    }
    (0, response_1.sendSuccess)(res, await (0, ml_service_1.getExceptionPredictions)(id));
}
//# sourceMappingURL=ml.controller.js.map