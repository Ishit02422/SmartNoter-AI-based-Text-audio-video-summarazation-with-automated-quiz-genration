"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subscription = void 0;
const lodash_1 = require("lodash");
class Subscription {
    constructor(input) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        this._id = input === null || input === void 0 ? void 0 : input._id;
        this.Coins = (_a = input === null || input === void 0 ? void 0 : input.Coins) !== null && _a !== void 0 ? _a : 0;
        this.receiptId = (_b = input === null || input === void 0 ? void 0 : input.receiptId) !== null && _b !== void 0 ? _b : "";
        this.userId = (_c = input === null || input === void 0 ? void 0 : input.userId) !== null && _c !== void 0 ? _c : "";
        this.data = (_d = input === null || input === void 0 ? void 0 : input.data) !== null && _d !== void 0 ? _d : "";
        this.deviceId = (_e = input === null || input === void 0 ? void 0 : input.deviceId) !== null && _e !== void 0 ? _e : "";
        this.appType = (_f = input === null || input === void 0 ? void 0 : input.appType) !== null && _f !== void 0 ? _f : "";
        this.price = (_g = input === null || input === void 0 ? void 0 : input.price) !== null && _g !== void 0 ? _g : "";
        this.store = (_h = input === null || input === void 0 ? void 0 : input.store) !== null && _h !== void 0 ? _h : "";
        this.purchase = (_j = input === null || input === void 0 ? void 0 : input.purchase) !== null && _j !== void 0 ? _j : "";
        this.expiredTime = input === null || input === void 0 ? void 0 : input.expiredTime;
        this.subscriptionType = input === null || input === void 0 ? void 0 : input.subscriptionType;
        this.originalTransactionId = input === null || input === void 0 ? void 0 : input.originalTransactionId;
        this.detail = (_k = input === null || input === void 0 ? void 0 : input.detail) !== null && _k !== void 0 ? _k : {};
        this.createdAt = (input === null || input === void 0 ? void 0 : input.createdAt) ? new Date(input.createdAt) : new Date();
        this.updatedAt = (input === null || input === void 0 ? void 0 : input.updatedAt) ? new Date(input.updatedAt) : new Date();
    }
    toJSON() {
        return (0, lodash_1.omitBy)(this, lodash_1.isUndefined);
    }
    toComparable() {
        return (0, lodash_1.omitBy)(this, lodash_1.isNil);
    }
}
exports.Subscription = Subscription;
//# sourceMappingURL=subscription.js.map