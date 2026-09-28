"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_1 = require("./dashboard.controller");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.get('/summary', dashboard_controller_1.getDashboardSummary);
router.get('/premium-trend', dashboard_controller_1.getPremiumTrend);
router.get('/exception-distribution', dashboard_controller_1.getExceptionDistribution);
router.get('/severity-distribution', dashboard_controller_1.getSeverityDistribution);
router.get('/recent-exceptions', dashboard_controller_1.getRecentExceptions);
exports.default = router;
//# sourceMappingURL=dashboard.routes.js.map