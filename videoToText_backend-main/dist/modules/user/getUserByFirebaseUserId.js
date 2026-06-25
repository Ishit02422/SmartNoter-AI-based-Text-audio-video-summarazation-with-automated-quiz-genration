"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserByFirebaseUserId = void 0;
const _1 = require(".");
const schema_1 = require("./schema");
/**
 *
 * @param email user email
 * @returns null or User class
 */
const getUserByFirebaseUserId = async (firebaseId) => {
    const user = await schema_1.UserModel.findOne({ firebaseUserId: firebaseId });
    return user ? new _1.User(user) : null;
};
exports.getUserByFirebaseUserId = getUserByFirebaseUserId;
//# sourceMappingURL=getUserByFirebaseUserId.js.map