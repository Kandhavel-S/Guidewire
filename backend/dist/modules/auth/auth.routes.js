"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
router.post('/login', auth_controller_1.login);
router.post('/logout', auth_1.requireAuth, auth_controller_1.logout);
router.get('/me', auth_1.requireAuth, auth_controller_1.getMe);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map