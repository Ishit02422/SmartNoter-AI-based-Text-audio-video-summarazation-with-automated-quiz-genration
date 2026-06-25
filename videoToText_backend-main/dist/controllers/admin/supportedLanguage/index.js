"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const filesUpload_1 = require("../../../middleware/filesUpload");
const validateAuthIdToken_1 = require("../../../middleware/validateAuthIdToken");
const validateIsAdmin_1 = require("../../../middleware/validateIsAdmin");
const supportedLanguage_controller_1 = __importDefault(require("./supportedLanguage.controller"));
const express_1 = require("express");
class AdminSupportedLanguage extends supportedLanguage_controller_1.default {
    constructor() {
        super();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post("/", validateAuthIdToken_1.validateAuthIdToken, validateIsAdmin_1.validateIsAdmin, filesUpload_1.filesUpload, this.createSupportedLanguage);
        this.router.patch("/", validateAuthIdToken_1.validateAuthIdToken, validateIsAdmin_1.validateIsAdmin, this.updateSupportedLanguage);
        this.router.get("/", this.getSupportedLanguage);
        this.router.delete("/:id", validateAuthIdToken_1.validateAuthIdToken, validateIsAdmin_1.validateIsAdmin, this.deleteSupportedLanguage);
    }
}
exports.default = AdminSupportedLanguage;
//# sourceMappingURL=index.js.map