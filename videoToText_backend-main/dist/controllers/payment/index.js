"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = void 0;
const express_1 = require("express");
const controller_1 = __importDefault(require("./controller"));
class Payment extends controller_1.default {
    constructor() {
        super();
        this.router = (0, express_1.Router)();
        this.router.post("/create-order", this.createOrder);
        this.router.post("/verify", this.verifyPayment);
    }
}
exports.Payment = Payment;
//# sourceMappingURL=index.js.map