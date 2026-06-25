"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Reward = void 0;
const express_1 = require("express");
const rewards_controller_1 = __importDefault(require("./rewards.controller"));
const validateAuthIdToken_1 = require("../../middleware/validateAuthIdToken");
class Reward extends rewards_controller_1.default {
    constructor() {
        super();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post("/createReward", validateAuthIdToken_1.validateAuthIdToken, this.createReferral);
        this.router.post("/submitReward", validateAuthIdToken_1.validateAuthIdToken, this.submitReferral);
        this.router.get("/", validateAuthIdToken_1.validateAuthIdToken, this.getReward);
    }
}
exports.Reward = Reward;
//# sourceMappingURL=index.js.map