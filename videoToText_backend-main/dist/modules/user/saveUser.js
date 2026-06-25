"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveUser = void 0;
const schema_1 = require("./schema");
/**
 *
 * @param user user class
 * @returns created user
 */
const saveUser = async (user) => {
    const savedUser = await new schema_1.UserModel(user.toJSON()).save();
    return savedUser;
};
exports.saveUser = saveUser;
//# sourceMappingURL=saveUser.js.map