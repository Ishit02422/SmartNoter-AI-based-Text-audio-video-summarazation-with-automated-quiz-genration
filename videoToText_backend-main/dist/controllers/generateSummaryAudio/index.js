"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const generateSummaryAudio_1 = require("./generateSummaryAudio");
const validateUserPremium_1 = require("../../middleware/validateUserPremium");
class GenerateSummaryAudio extends generateSummaryAudio_1.Controller {
    constructor() {
        super();
        this.router = (0, express_1.Router)();
        this.initializeRoute();
    }
    initializeRoute() {
        this.router.post("/", validateUserPremium_1.validateUserPremium, this.create);
        this.router.post("/direct", validateUserPremium_1.validateUserPremium, this.createDirect);
        this.router.patch("/:id", this.update);
        this.router.delete("/:id", this.delete);
    }
}
exports.default = GenerateSummaryAudio;
//# sourceMappingURL=index.js.map