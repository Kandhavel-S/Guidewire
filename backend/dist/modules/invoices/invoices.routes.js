"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const invoices_controller_1 = require("./invoices.controller");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.get('/', invoices_controller_1.getInvoices);
router.get('/:id', invoices_controller_1.getInvoiceById);
exports.default = router;
//# sourceMappingURL=invoices.routes.js.map