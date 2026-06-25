"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const generatedSummaryVideo_controller_1 = __importDefault(require("./generatedSummaryVideo.controller"));
const validateUserPremium_1 = require("../../middleware/validateUserPremium");
class GenerateSummaryFromVideo extends generatedSummaryVideo_controller_1.default {
    constructor() {
        super();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post("/youtube", validateUserPremium_1.validateUserPremium, this.create);
        this.router.post("/youtube/direct", validateUserPremium_1.validateUserPremium, this.createDirect);
        this.router.patch("/youtube/:id", this.update);
        this.router.post("/upload", validateUserPremium_1.validateUserPremium, this.uploadedVideo);
        this.router.post("/upload/direct", validateUserPremium_1.validateUserPremium, this.uploadedVideoDirect);
        this.router.patch("/youtube/:id", this.update);
        this.router.delete("/youtube/:id", this.delete);
        // this.router.get("/:id",)
        // this.router.get("/", )
    }
}
exports.default = GenerateSummaryFromVideo;
//# sourceMappingURL=index.js.map