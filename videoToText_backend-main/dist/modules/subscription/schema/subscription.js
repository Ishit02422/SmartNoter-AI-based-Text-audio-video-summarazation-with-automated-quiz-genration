"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionModel = void 0;
const mongoose_1 = require("mongoose");
const subscription = new mongoose_1.Schema({
    receiptId: { type: String, default: "" },
    userId: { type: mongoose_1.Types.ObjectId, ref: "users", default: null },
    data: { type: String, default: "" },
    Coins: {
        type: Number,
        default: 0,
    },
    deviceId: {
        type: String,
        default: "",
    },
    appType: {
        type: String,
        default: "",
    },
    price: {
        type: String,
        default: "",
    },
    store: {
        type: String,
        default: "",
    },
    purchase: {
        type: String,
        default: "",
    },
    detail: {
        type: Object,
        default: null,
    },
    expiredTime: {
        type: String,
        default: "",
    },
    subscriptionType: {
        type: String,
        default: "",
    },
    originalTransactionId: {
        type: String,
        default: "",
    },
}, { timestamps: true });
exports.SubscriptionModel = (0, mongoose_1.model)("subscription", subscription);
//# sourceMappingURL=subscription.js.map