"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reconciliation_controller_1 = require("./reconciliation.controller");
const auth_1 = require("../../middleware/auth");
const rbac_1 = require("../../middleware/rbac");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.post('/run', (0, rbac_1.requireMinRole)('FINANCE_ANALYST'), reconciliation_controller_1.startReconciliation);
router.get('/runs', reconciliation_controller_1.getReconciliationRuns);
router.get('/runs/:id', reconciliation_controller_1.getReconciliationRunById);
router.get('/results', reconciliation_controller_1.getLatestReconciliationResults);
exports.default = router;
//# sourceMappingURL=reconciliation.routes.js.map