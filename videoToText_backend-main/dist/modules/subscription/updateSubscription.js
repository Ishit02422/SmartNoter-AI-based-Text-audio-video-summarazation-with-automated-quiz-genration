"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSubscription = void 0;
const schema_1 = require("./schema");
const updateSubscription = async (subscription) => {
    await schema_1.SubscriptionModel.findByIdAndUpdate(subscription._id, subscription);
    return subscription;
};
exports.updateSubscription = updateSubscription;
//# sourceMappingURL=updateSubscription.js.map