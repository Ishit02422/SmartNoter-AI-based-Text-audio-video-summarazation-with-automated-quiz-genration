"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserById = void 0;
const _1 = require(".");
const schema_1 = require("./schema");
/**
 *
 * @param _id user id
 * @returns relevant user record | null
 */
const getUserById = async (_id) => {
    const user = await schema_1.UserModel.findById(_id).lean();
    return user ? new _1.User(user) : null;
};
exports.getUserById = getUserById;
//# sourceMappingURL=getUserById.js.map