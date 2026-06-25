"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubscriptionByUserId = void 0;
const schema_1 = require("./schema");
const getSubscriptionByUserId = async (userId) => {
    const subscription = await schema_1.SubscriptionModel.find({ userId }).sort({ createdAt: -1 });
    return subscription;
};
exports.getSubscriptionByUserId = getSubscriptionByUserId;
//# sourceMappingURL=getSubscriptionByUserid.js.map