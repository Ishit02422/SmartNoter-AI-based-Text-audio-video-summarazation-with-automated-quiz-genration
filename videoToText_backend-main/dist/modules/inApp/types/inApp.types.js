"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InApp = void 0;
const lodash_1 = require("lodash");
const mongoose_1 = require("mongoose");
class InApp {
    constructor(input) {
        this._id = (input === null || input === void 0 ? void 0 : input._id)
            ? input === null || input === void 0 ? void 0 : input._id.toString()
            : new mongoose_1.Types.ObjectId().toString();
        this.receiptId = input === null || input === void 0 ? void 0 : input.receiptId;
        this.userId = input === null || input === void 0 ? void 0 : input.userId;
        this.deviceId = input === null || input === void 0 ? void 0 : input.deviceId;
        this.premiumType = input === null || input === void 0 ? void 0 : input.premiumType;
        this.data = input === null || input === void 0 ? void 0 : input.data;
        this.appType = input === null || input === void 0 ? void 0 : input.appType;
        this.detail = input === null || input === void 0 ? void 0 : input.detail;
        this.price = input === null || input === void 0 ? void 0 : input.price;
        this.store = input === null || input === void 0 ? void 0 : input.store;
        this.purchase = input === null || input === void 0 ? void 0 : input.purchase;
        this.createdAt = input === null || input === void 0 ? void 0 : input.createdAt;
        this.updatedAt = input === null || input === void 0 ? void 0 : input.updatedAt;
        this.glitter = input === null || input === void 0 ? void 0 : input.glitter;
    }
    toJSON() {
        return (0, lodash_1.omitBy)(this, lodash_1.isUndefined);
    }
}
exports.InApp = InApp;
InApp.adminTypes = ["ADMIN", "SUPER ADMIN"];
//# sourceMappingURL=inApp.types.js.map