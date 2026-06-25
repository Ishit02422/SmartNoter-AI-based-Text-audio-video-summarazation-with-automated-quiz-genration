"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MindMap = void 0;
const express_1 = require("express");
const mindMap_controller_1 = __importDefault(require("./mindMap.controller"));
const validateAuthIdToken_1 = require("../../middleware/validateAuthIdToken");
const validateUserPremium_1 = require("../../middleware/validateUserPremium");
class MindMap extends mindMap_controller_1.default {
    constructor() {
        super();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post("/", validateAuthIdToken_1.validateAuthIdToken, validateUserPremium_1.validateUserPremium, this.create);
        this.router.post("/getMindMap", validateAuthIdToken_1.validateAuthIdToken, validateUserPremium_1.validateUserPremium, this.getMindMapBySummary);
    }
}
exports.MindMap = MindMap;
//# sourceMappingURL=index.js.map