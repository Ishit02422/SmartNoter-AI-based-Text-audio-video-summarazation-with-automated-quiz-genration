"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImageByUserId = void 0;
const schema_1 = require("./schema");
const getImageByUserId = async (userId) => {
    const user = await schema_1.UserModel.findById(userId).select("-password").populate({
        path: "profileImage",
    });
    return user;
};
exports.getImageByUserId = getImageByUserId;
//# sourceMappingURL=getImageByUserId.js.map