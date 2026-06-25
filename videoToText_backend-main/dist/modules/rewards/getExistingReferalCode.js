"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExistingReward = void 0;
const schema_1 = require("./schema");
const getExistingReward = async (userId, type = "REFER_EARN", status) => {
    const qry = {
        userId,
        type
    };
    if (status) {
        qry.status = status;
    }
    const referalCode = await schema_1.RewardModel.findOne(qry);
    return referalCode;
};
exports.getExistingReward = getExistingReward;
//# sourceMappingURL=getExistingReferalCode.js.map