"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserByEmail = void 0;
const _1 = require(".");
const schema_1 = require("./schema");
/**
 *
 * @param email user email
 * @returns null or User class
 */
const getUserByEmail = async (email) => {
    const user = await schema_1.UserModel.findOne({
        email: { $regex: new RegExp(`^${email}$`), $options: "i" },
    });
    return user ? new _1.User(user) : null;
};
exports.getUserByEmail = getUserByEmail;
//# sourceMappingURL=getUserByEmail.js.map