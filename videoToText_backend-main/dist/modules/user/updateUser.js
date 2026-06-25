"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserByQry = exports.updateUser = void 0;
const schema_1 = require("./schema");
/**
 *
 * @param user
 * @returns update user record
 */
const updateUser = async (user) => {
    await schema_1.UserModel.findByIdAndUpdate(user._id, user.toJSON());
    return user;
};
exports.updateUser = updateUser;
const updateUserByQry = async ({ query, update, }) => {
    return await schema_1.UserModel.findOneAndUpdate(query, update, {
        new: true,
        upsert: true,
    });
};
exports.updateUserByQry = updateUserByQry;
//# sourceMappingURL=updateUser.js.map