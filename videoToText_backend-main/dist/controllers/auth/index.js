"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validateAuthIdToken_1 = require("../../middleware/validateAuthIdToken");
const auth_controller_1 = __importDefault(require("./auth.controller"));
class Auth extends auth_controller_1.default {
    constructor() {
        super();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post("/loginWithGoogle", this.loginWithGoogle);
        this.router.post("/loginWithApple", this.loginWithApple);
        this.router.post("/logout", validateAuthIdToken_1.validateAuthIdToken, this.logout);
        this.router.post("/duplicate", this.duplicate);
        this.router.post("/guest", this.guest);
        this.router.post("/session", validateAuthIdToken_1.validateAuthIdToken, this.session);
    }
}
exports.default = Auth;
//# sourceMappingURL=index.js.map