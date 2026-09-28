"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
exports.connectDatabase = connectDatabase;
exports.disconnectDatabase = disconnectDatabase;
const client_1 = require("@prisma/client");
exports.prisma = global.__prisma ||
    new client_1.PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
if (process.env.NODE_ENV !== 'production') {
    global.__prisma = exports.prisma;
}
async function connectDatabase() {
    await exports.prisma.$connect();
    console.log('✅ Database connected');
}
async function disconnectDatabase() {
    await exports.prisma.$disconnect();
    console.log('📴 Database disconnected');
}
//# sourceMappingURL=database.js.map