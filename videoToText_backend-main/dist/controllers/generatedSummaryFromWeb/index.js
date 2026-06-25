"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const generatedSummary_controller_1 = __importDefault(require("./generatedSummary.controller"));
const validateAuthIdToken_1 = require("../../middleware/validateAuthIdToken");
const validateUserPremium_1 = require("../../middleware/validateUserPremium");
class GeneratedSummaryFromWeb extends generatedSummary_controller_1.default {
    constructor() {
        super();
        this.router = (0, express_1.Router)();
        this.initilizeRoutes();
    }
    initilizeRoutes() {
        this.router.post("/", validateAuthIdToken_1.validateAuthIdToken, validateUserPremium_1.validateUserPremium, this.create);
        this.router.post("/direct", validateAuthIdToken_1.validateAuthIdToken, validateUserPremium_1.validateUserPremium, this.createDirect);
        this.router.patch("/:id", validateAuthIdToken_1.validateAuthIdToken, this.update);
        this.router.delete("/:id", validateAuthIdToken_1.validateAuthIdToken, this.delete);
    }
}
exports.default = GeneratedSummaryFromWeb;
//# sourceMappingURL=index.js.map