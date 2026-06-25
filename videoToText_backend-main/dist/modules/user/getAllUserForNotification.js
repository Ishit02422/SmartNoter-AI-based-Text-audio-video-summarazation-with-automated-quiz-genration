"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUserForNotification = void 0;
const _1 = require(".");
const schema_1 = require("./schema");
/**
 *
 * @param _id user id
 * @returns relevant user record | null
 */
const getAllUserForNotification = async () => {
    const user = await schema_1.UserModel.find().select("FCMToken");
    return user ? user.map((item) => new _1.User(item)) : null;
};
exports.getAllUserForNotification = getAllUserForNotification;
//# sourceMappingURL=getAllUserForNotification.js.map