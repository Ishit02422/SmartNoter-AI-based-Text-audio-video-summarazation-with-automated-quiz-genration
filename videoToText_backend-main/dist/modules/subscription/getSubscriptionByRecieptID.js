"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubscriptionByReceiptId = void 0;
const schema_1 = require("./schema");
const getSubscriptionByReceiptId = async (receiptId) => {
    const subscription = await schema_1.SubscriptionModel.findOne({ receiptId });
    return subscription;
};
exports.getSubscriptionByReceiptId = getSubscriptionByReceiptId;
//# sourceMappingURL=getSubscriptionByRecieptID.js.map