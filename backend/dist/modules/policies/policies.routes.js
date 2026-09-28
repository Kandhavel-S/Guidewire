"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const policies_controller_1 = require("./policies.controller");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.get('/', policies_controller_1.getPolicies);
router.get('/:id', policies_controller_1.getPolicyById);
exports.default = router;
//# sourceMappingURL=policies.routes.js.map