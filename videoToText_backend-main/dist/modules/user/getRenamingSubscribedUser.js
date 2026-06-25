"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRenamingSubscribedUser = void 0;
const schema_1 = require("./schema");
/**
 *
 * @returns all inApp records | empty array
 */
const getRenamingSubscribedUser = async (isProUser) => {
    const inApp = await schema_1.UserModel.find({ isProUser });
    return inApp;
};
exports.getRenamingSubscribedUser = getRenamingSubscribedUser;
//# sourceMappingURL=getRenamingSubscribedUser.js.map