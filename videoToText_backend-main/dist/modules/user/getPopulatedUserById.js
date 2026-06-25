"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPopulatedUserById = void 0;
const lodash_1 = require("lodash");
const _1 = require(".");
const schema_1 = require("./schema");
const history_1 = require("../history");
/**
 *
 * @param _id user id
 * @returns return populated account
 */
const getPopulatedUserById = async (_id) => {
    const [user, totalSummaries] = await Promise.all([
        schema_1.UserModel.findById(_id).select("-password").populate({
            path: "profileImage",
        }).lean(),
        (0, history_1.getTotalSummaryCountByUserId)(_id)
    ]);
    if (!user)
        return null;
    return new _1.User({
        ...(0, lodash_1.omit)(user, ["RESETToken"]),
        totalSummaries
    });
};
exports.getPopulatedUserById = getPopulatedUserById;
//# sourceMappingURL=getPopulatedUserById.js.map