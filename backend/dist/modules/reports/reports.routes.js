"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reports_controller_1 = require("./reports.controller");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.get('/reconciliation', reports_controller_1.getReconciliationReport);
router.get('/exceptions', reports_controller_1.getExceptionsReport);
router.get('/payments', reports_controller_1.getPaymentsReport);
// CSV exports
router.get('/exceptions/export', reports_controller_1.exportExceptionsCSV);
router.get('/reconciliation/export', reports_controller_1.exportReconciliationCSV);
router.get('/payments/export', reports_controller_1.exportPaymentsCSV);
exports.default = router;
//# sourceMappingURL=reports.routes.js.map