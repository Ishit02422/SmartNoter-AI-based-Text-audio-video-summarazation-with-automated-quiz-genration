"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subscription = void 0;
const express_1 = require("express");
const controller_1 = __importDefault(require("./controller"));
class Subscription extends controller_1.default {
    constructor() {
        super();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post("/purchaseCoins", this.purchaseCoinsSubscriptionController);
    }
}
exports.Subscription = Subscription;
//# sourceMappingURL=index.js.map