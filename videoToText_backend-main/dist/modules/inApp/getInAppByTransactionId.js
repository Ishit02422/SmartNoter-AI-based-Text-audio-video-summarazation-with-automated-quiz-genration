"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInAppByTransactionId = void 0;
const schema_1 = require("./schema");
/**
 *
 * @returns all inApp records | empty array
 */
const getInAppByTransactionId = async (originalTransactionId) => {
    const inApp = await schema_1.inAppModel.findOne({ originalTransactionId });
    return inApp;
};
exports.getInAppByTransactionId = getInAppByTransactionId;
//# sourceMappingURL=getInAppByTransactionId.js.map