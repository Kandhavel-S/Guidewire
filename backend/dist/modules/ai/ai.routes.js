"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ai_controller_1 = require("./ai.controller");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.post('/exceptions/:id/analyze', ai_controller_1.analyzeException);
router.post('/exceptions/:id/summary', ai_controller_1.generateSummary);
router.post('/exceptions/:id/chat', ai_controller_1.chatWithAI);
router.post('/dashboard-insights', ai_controller_1.getDashboardInsights);
router.post('/search', ai_controller_1.naturalLanguageSearch);
exports.default = router;
//# sourceMappingURL=ai.routes.js.map