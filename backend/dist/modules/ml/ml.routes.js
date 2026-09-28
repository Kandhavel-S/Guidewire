"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const ml_controller_1 = require("./ml.controller");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.get('/predictions', ml_controller_1.listPredictions);
router.get('/exceptions/:id', ml_controller_1.listExceptionPredictions);
exports.default = router;
//# sourceMappingURL=ml.routes.js.map