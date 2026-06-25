"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inAppModel = void 0;
const mongoose_1 = require("mongoose");
const inApp = new mongoose_1.Schema({
    receiptId: { type: String },
    userId: { type: mongoose_1.Types.ObjectId, ref: "users", default: null },
    data: { type: String },
    glitter: {
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
    premiumType: {
        type: String,
        default: "FREE",
    },
    detail: {
        environment: {
            type: String,
            default: "",
        },
        latestReceipt: { type: String, default: "" },
        latestData: { type: String, default: "" },
    },
}, { timestamps: true });
exports.inAppModel = (0, mongoose_1.model)("inApp", inApp);
//# sourceMappingURL=inApp.schema.js.map