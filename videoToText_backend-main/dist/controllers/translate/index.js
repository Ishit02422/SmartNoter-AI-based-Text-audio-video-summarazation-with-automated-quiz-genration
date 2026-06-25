"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Translate = void 0;
const express_1 = require("express");
const validateAuthIdToken_1 = require("../../middleware/validateAuthIdToken");
const controller_1 = __importDefault(require("./controller"));
const validateUserPremium_1 = require("../../middleware/validateUserPremium");
class Translate extends controller_1.default {
    constructor() {
        super();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post("/", validateAuthIdToken_1.validateAuthIdToken, validateUserPremium_1.validateUserPremium, this.create);
    }
}
exports.Translate = Translate;
//# sourceMappingURL=index.js.map