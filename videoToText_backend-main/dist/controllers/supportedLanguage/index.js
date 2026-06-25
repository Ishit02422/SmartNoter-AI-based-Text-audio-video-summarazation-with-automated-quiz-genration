"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supportedLanguage_controller_1 = __importDefault(require("./supportedLanguage.controller"));
const express_1 = require("express");
class SupportedLanguage extends supportedLanguage_controller_1.default {
    constructor() {
        super();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/", this.getSupportedLanguage);
    }
}
exports.default = SupportedLanguage;
//# sourceMappingURL=index.js.map