"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const inApp_controller_1 = __importDefault(require("./inApp.controller"));
const express_1 = require("express");
const validateAuthIdToken_1 = require("../../middleware/validateAuthIdToken");
class InApp extends inApp_controller_1.default {
    constructor() {
        super();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post("/purchaseGlitter", validateAuthIdToken_1.validateAuthIdToken, this.purchaseGlitter);
        this.router.post("/purchaseSubscription", validateAuthIdToken_1.validateAuthIdToken, this.purchaseSubscriptionController);
    }
}
exports.default = InApp;
//# sourceMappingURL=index.js.map