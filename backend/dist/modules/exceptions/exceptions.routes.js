"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const exceptions_controller_1 = require("./exceptions.controller");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.get('/', exceptions_controller_1.getExceptions);
router.get('/:id', exceptions_controller_1.getExceptionById);
router.patch('/:id/status', exceptions_controller_1.updateExceptionStatus);
router.patch('/:id/assign', exceptions_controller_1.assignException);
router.post('/:id/notes', exceptions_controller_1.addExceptionNote);
router.post('/:id/resolve', exceptions_controller_1.resolveException);
exports.default = router;
//# sourceMappingURL=exceptions.routes.js.map