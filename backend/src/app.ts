import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';

import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Route modules
import authRoutes from './modules/auth/auth.routes';
import policyRoutes from './modules/policies/policies.routes';
import invoiceRoutes from './modules/invoices/invoices.routes';
import paymentRoutes from './modules/payments/payments.routes';
import exceptionRoutes from './modules/exceptions/exceptions.routes';
import reconciliationRoutes from './modules/reconciliation/reconciliation.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import reportsRoutes from './modules/reports/reports.routes';
import aiRoutes from './modules/ai/ai.routes';
import billingCenterRoutes from './mock-billing-center/billingCenter.routes';

const app = express();

// ─────────────────────────────────────────────
// Security Middleware
// ─────────────────────────────────────────────

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: [env.FRONTEND_URL, 'http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  message: { success: false, message: 'Too many requests', code: 'RATE_LIMIT_EXCEEDED' },
});

app.use('/api', limiter);

// ─────────────────────────────────────────────
// Body Parsing
// ─────────────────────────────────────────────

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ─────────────────────────────────────────────
// Logging
// ─────────────────────────────────────────────

if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.IS_PRODUCTION ? 'combined' : 'dev'));
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
    environment: env.NODE_ENV,
  });
});

// ─────────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/exceptions', exceptionRoutes);
app.use('/api/reconciliation', reconciliationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/mock-billing', billingCenterRoutes);

// ─────────────────────────────────────────────
// Error Handling
// ─────────────────────────────────────────────

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
