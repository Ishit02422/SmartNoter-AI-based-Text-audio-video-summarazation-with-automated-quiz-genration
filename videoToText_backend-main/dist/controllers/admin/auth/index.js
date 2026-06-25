"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validateAuthIdToken_1 = require("../../../middleware/validateAuthIdToken");
const validateIsAdmin_1 = require("../../../middleware/validateIsAdmin");
const auth_controller_1 = __importDefault(require("./auth.controller"));
class AdminAuth extends auth_controller_1.default {
    constructor() {
        super();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post("/login", this.login);
        this.router.post("/register", this.register);
        this.router.post("/session", validateAuthIdToken_1.validateAuthIdToken, validateIsAdmin_1.validateIsAdmin, this.session);
        this.router.post("/logout", validateAuthIdToken_1.validateAuthIdToken, validateIsAdmin_1.validateIsAdmin, this.logout);
    }
}
exports.default = AdminAuth;
//# sourceMappingURL=index.js.map