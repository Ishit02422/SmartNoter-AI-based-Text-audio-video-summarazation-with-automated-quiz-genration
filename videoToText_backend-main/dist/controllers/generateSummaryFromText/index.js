"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validateAuthIdToken_1 = require("../../middleware/validateAuthIdToken");
const generatedSummaryText_1 = require("./generatedSummaryText");
const validateUserPremium_1 = require("../../middleware/validateUserPremium");
class GenerateSummaryFromText extends generatedSummaryText_1.Controller {
    constructor() {
        super();
        this.router = (0, express_1.Router)();
        this.initializeRoute();
    }
    initializeRoute() {
        this.router.post("/", validateAuthIdToken_1.validateAuthIdToken, validateUserPremium_1.validateUserPremium, this.create);
        this.router.post("/direct", validateAuthIdToken_1.validateAuthIdToken, validateUserPremium_1.validateUserPremium, this.createDirect);
        this.router.patch("/:id", validateAuthIdToken_1.validateAuthIdToken, this.update);
        this.router.delete("/:id", validateAuthIdToken_1.validateAuthIdToken, this.delete);
    }
}
exports.default = GenerateSummaryFromText;
//# sourceMappingURL=index.js.map