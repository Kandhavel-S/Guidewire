"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bcGetPolicies = bcGetPolicies;
exports.bcGetPolicyById = bcGetPolicyById;
exports.bcGetInvoices = bcGetInvoices;
exports.bcGetInvoiceById = bcGetInvoiceById;
exports.bcGetPayments = bcGetPayments;
exports.bcGetPaymentById = bcGetPaymentById;
exports.bcGetAccounts = bcGetAccounts;
exports.bcGetAccountById = bcGetAccountById;
const billingCenter_service_1 = require("./billingCenter.service");
const response_1 = require("../utils/response");
async function bcGetPolicies(req, res) {
    const { page, limit } = (0, response_1.getPaginationParams)(req.query);
    const { search, type, status } = req.query;
    const result = await billingCenter_service_1.billingCenterService.getPolicies({ page, limit, search, type, status });
    (0, response_1.sendSuccess)(res, result);
}
async function bcGetPolicyById(req, res) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const policy = await billingCenter_service_1.billingCenterService.getPolicyById(id);
    if (!policy) {
        (0, response_1.sendError)(res, 'Policy not found', 404, 'BC_POLICY_NOT_FOUND');
        return;
    }
    (0, response_1.sendSuccess)(res, policy);
}
async function bcGetInvoices(req, res) {
    const { page, limit } = (0, response_1.getPaginationParams)(req.query);
    const { policyId, status } = req.query;
    const result = await billingCenter_service_1.billingCenterService.getInvoices({ page, limit, policyId, status });
    (0, response_1.sendSuccess)(res, result);
}
async function bcGetInvoiceById(req, res) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const invoice = await billingCenter_service_1.billingCenterService.getInvoiceById(id);
    if (!invoice) {
        (0, response_1.sendError)(res, 'Invoice not found', 404, 'BC_INVOICE_NOT_FOUND');
        return;
    }
    (0, response_1.sendSuccess)(res, invoice);
}
async function bcGetPayments(req, res) {
    const { page, limit } = (0, response_1.getPaginationParams)(req.query);
    const { invoiceId, status } = req.query;
    const result = await billingCenter_service_1.billingCenterService.getPayments({ page, limit, invoiceId, status });
    (0, response_1.sendSuccess)(res, result);
}
async function bcGetPaymentById(req, res) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const payment = await billingCenter_service_1.billingCenterService.getPaymentById(id);
    if (!payment) {
        (0, response_1.sendError)(res, 'Payment not found', 404, 'BC_PAYMENT_NOT_FOUND');
        return;
    }
    (0, response_1.sendSuccess)(res, payment);
}
async function bcGetAccounts(req, res) {
    const { page, limit } = (0, response_1.getPaginationParams)(req.query);
    const { policyId } = req.query;
    const result = await billingCenter_service_1.billingCenterService.getAccounts({ page, limit, policyId });
    (0, response_1.sendSuccess)(res, result);
}
async function bcGetAccountById(req, res) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const account = await billingCenter_service_1.billingCenterService.getAccountById(id);
    if (!account) {
        (0, response_1.sendError)(res, 'Account not found', 404, 'BC_ACCOUNT_NOT_FOUND');
        return;
    }
    (0, response_1.sendSuccess)(res, account);
}
//# sourceMappingURL=billingCenter.controller.js.map