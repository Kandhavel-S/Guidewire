"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const env_1 = require("./config/env");
const errorHandler_1 = require("./middleware/errorHandler");
// Route modules
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const policies_routes_1 = __importDefault(require("./modules/policies/policies.routes"));
const invoices_routes_1 = __importDefault(require("./modules/invoices/invoices.routes"));
const payments_routes_1 = __importDefault(require("./modules/payments/payments.routes"));
const exceptions_routes_1 = __importDefault(require("./modules/exceptions/exceptions.routes"));
const reconciliation_routes_1 = __importDefault(require("./modules/reconciliation/reconciliation.routes"));
const dashboard_routes_1 = __importDefault(require("./modules/dashboard/dashboard.routes"));
const reports_routes_1 = __importDefault(require("./modules/reports/reports.routes"));
const ai_routes_1 = __importDefault(require("./modules/ai/ai.routes"));
const billingCenter_routes_1 = __importDefault(require("./mock-billing-center/billingCenter.routes"));
const ml_routes_1 = __importDefault(require("./modules/ml/ml.routes"));
const app = (0, express_1.default)();
// ─────────────────────────────────────────────
// Security Middleware
// ─────────────────────────────────────────────
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use((0, cors_1.default)({
    origin: [env_1.env.FRONTEND_URL, 'http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500,
    message: { success: false, message: 'Too many requests', code: 'RATE_LIMIT_EXCEEDED' },
});
app.use('/api', limiter);
// ─────────────────────────────────────────────
// Body Parsing
// ─────────────────────────────────────────────
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, cookie_parser_1.default)());
// ─────────────────────────────────────────────
// Logging
// ─────────────────────────────────────────────
if (env_1.env.NODE_ENV !== 'test') {
    app.use((0, morgan_1.default)(env_1.env.IS_PRODUCTION ? 'combined' : 'dev'));
}
// ─────────────────────────────────────────────
// Health Check
// ─────────────────────────────────────────────
app.get('/health', (_req, res) => {
    res.json({
        success: true,
        service: 'InsureFlow API',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: env_1.env.NODE_ENV,
    });
});
// ─────────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────────
app.use('/api/auth', auth_routes_1.default);
app.use('/api/policies', policies_routes_1.default);
app.use('/api/invoices', invoices_routes_1.default);
app.use('/api/payments', payments_routes_1.default);
app.use('/api/exceptions', exceptions_routes_1.default);
app.use('/api/reconciliation', reconciliation_routes_1.default);
app.use('/api/dashboard', dashboard_routes_1.default);
app.use('/api/reports', reports_routes_1.default);
app.use('/api/ai', ai_routes_1.default);
app.use('/api/mock-billing', billingCenter_routes_1.default);
app.use('/api/ml', ml_routes_1.default);
// ─────────────────────────────────────────────
// Error Handling
// ─────────────────────────────────────────────
app.use(errorHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map