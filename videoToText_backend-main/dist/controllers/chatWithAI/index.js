"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chatWithAI_controller_1 = __importDefault(require("./chatWithAI.controller"));
const validateAuthIdToken_1 = require("../../middleware/validateAuthIdToken");
const validateUserPremium_1 = require("../../middleware/validateUserPremium");
class ChatWithAI extends chatWithAI_controller_1.default {
    constructor() {
        super();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post("/", validateAuthIdToken_1.validateAuthIdToken, validateUserPremium_1.validateUserPremium, this.create);
        this.router.post("/enterToChat", validateAuthIdToken_1.validateAuthIdToken, validateUserPremium_1.validateUserPremium, this.enterChat);
    }
}
exports.default = ChatWithAI;
//# sourceMappingURL=index.js.map