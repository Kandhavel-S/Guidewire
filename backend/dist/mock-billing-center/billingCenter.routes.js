"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const billingCenter_controller_1 = require("./billingCenter.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.get('/policies', billingCenter_controller_1.bcGetPolicies);
router.get('/policies/:id', billingCenter_controller_1.bcGetPolicyById);
router.get('/invoices', billingCenter_controller_1.bcGetInvoices);
router.get('/invoices/:id', billingCenter_controller_1.bcGetInvoiceById);
router.get('/payments', billingCenter_controller_1.bcGetPayments);
router.get('/payments/:id', billingCenter_controller_1.bcGetPaymentById);
router.get('/accounts', billingCenter_controller_1.bcGetAccounts);
router.get('/accounts/:id', billingCenter_controller_1.bcGetAccountById);
exports.default = router;
//# sourceMappingURL=billingCenter.routes.js.map