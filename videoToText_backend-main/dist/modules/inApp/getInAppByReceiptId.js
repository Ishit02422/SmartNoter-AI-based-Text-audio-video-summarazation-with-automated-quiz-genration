"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInAppByReceiptId = void 0;
const schema_1 = require("./schema");
/**
 *
 * @returns all inApp records | empty array
 */
const getInAppByReceiptId = async (receiptId) => {
    const inApp = await schema_1.inAppModel.findOne({ receiptId });
    return inApp;
};
exports.getInAppByReceiptId = getInAppByReceiptId;
//# sourceMappingURL=getInAppByReceiptId.js.map