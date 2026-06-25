"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserByDeviceId = void 0;
const schema_1 = require("./schema");
/**
 *
 * @param deviceId
 * @returns relevant user record | null
 */
const getUserByDeviceId = async (deviceId) => {
    const user = await schema_1.UserModel.findOne({ deviceId });
    return user ? user : null;
};
exports.getUserByDeviceId = getUserByDeviceId;
//# sourceMappingURL=getUserByDeviceId.js.map