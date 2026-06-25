"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveSubscription = void 0;
const schema_1 = require("./schema");
const saveSubscription = async (subscription) => {
    await new schema_1.SubscriptionModel(subscription).save();
    return subscription;
};
exports.saveSubscription = saveSubscription;
//# sourceMappingURL=saveSubscription.js.map