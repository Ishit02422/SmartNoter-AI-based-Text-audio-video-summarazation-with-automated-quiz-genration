"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInAppByUserId = void 0;
const schema_1 = require("./schema");
/**
 *
 * @returns all inApp records | empty array
 */
const getInAppByUserId = async (userId) => {
    const inApp = await schema_1.inAppModel.find({ userId }).sort({ createdAt: -1 });
    return inApp;
};
exports.getInAppByUserId = getInAppByUserId;
//# sourceMappingURL=getInAppByUserId.js.map