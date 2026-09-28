"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function requireEnv(name, defaultValue) {
    const val = process.env[name] || defaultValue;
    if (!val) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return val;
}
exports.env = {
    PORT: parseInt(process.env.PORT || '5000', 10),
    NODE_ENV: process.env.NODE_ENV || 'development',
    DATABASE_URL: requireEnv('DATABASE_URL'),
    JWT_SECRET: requireEnv('JWT_SECRET', 'insureflow-dev-secret'),
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
    AI_API_KEY: process.env.AI_API_KEY || '',
    AI_MODEL: process.env.AI_MODEL || 'gpt-4o-mini',
    AI_BASE_URL: process.env.AI_BASE_URL || 'https://api.openai.com/v1',
    IS_PRODUCTION: process.env.NODE_ENV === 'production',
};
//# sourceMappingURL=env.js.map