"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUser = void 0;
const _1 = require(".");
const schema_1 = require("./schema");
/**
 *
 * @param _id user id
 * @returns relevant user record | null
 */
const getAllUser = async () => {
    const user = await schema_1.UserModel.find().select("firstName lastName email isAppleLogin isGoogleLogin isFacebookLogin isGuestLogin glitter deviceId createdAt updatedAt");
    return user ? user.map((item) => new _1.User(item)) : null;
};
exports.getAllUser = getAllUser;
//# sourceMappingURL=getAllUser.js.map