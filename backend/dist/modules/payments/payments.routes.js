"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payments_controller_1 = require("./payments.controller");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.get('/', payments_controller_1.getPayments);
router.get('/:id', payments_controller_1.getPaymentById);
exports.default = router;
//# sourceMappingURL=payments.routes.js.map