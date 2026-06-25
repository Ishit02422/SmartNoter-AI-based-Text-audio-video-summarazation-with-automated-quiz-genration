"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const generatedSummary_controller_1 = __importDefault(require("./generatedSummary.controller"));
const express_1 = require("express");
const validateAuthIdToken_1 = require("../../middleware/validateAuthIdToken");
class GeneratedSummary extends generatedSummary_controller_1.default {
    constructor() {
        super();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post("/", validateAuthIdToken_1.validateAuthIdToken, this.create);
        this.router.patch("/:id", validateAuthIdToken_1.validateAuthIdToken, this.update);
    }
}
exports.default = GeneratedSummary;
//# sourceMappingURL=index.js.map