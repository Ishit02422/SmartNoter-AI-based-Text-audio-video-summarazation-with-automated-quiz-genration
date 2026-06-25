"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const generatedSummaryPdf_1 = require("./generatedSummaryPdf");
const validateUserPremium_1 = require("../../middleware/validateUserPremium");
class GenerateSummaryPdf extends generatedSummaryPdf_1.Controller {
    constructor() {
        super();
        this.router = (0, express_1.Router)();
        this.initializeRoute();
    }
    initializeRoute() {
        this.router.post("/", validateUserPremium_1.validateUserPremium, this.create);
        this.router.post("/direct", validateUserPremium_1.validateUserPremium, this.createDirect);
        // Alias routes for frontend compatibility
        this.router.post("/uploadPDF/direct", validateUserPremium_1.validateUserPremium, this.createDirect);
        this.router.post("/uploadPDF", validateUserPremium_1.validateUserPremium, this.createDirect);
        this.router.patch("/:id", this.update);
        this.router.delete("/:id", this.delete);
    }
}
exports.default = GenerateSummaryPdf;
//# sourceMappingURL=index.js.map