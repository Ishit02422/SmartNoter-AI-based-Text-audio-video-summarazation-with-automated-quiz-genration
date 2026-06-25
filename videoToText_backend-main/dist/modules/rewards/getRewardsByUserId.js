"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRewardByUserId = void 0;
const schema_1 = require("./schema");
const getRewardByUserId = async (userId, type) => {
    let qry = { userId };
    if (type) {
        qry.type = type;
    }
    const rewards = await schema_1.RewardModel.find(qry);
    return rewards;
};
exports.getRewardByUserId = getRewardByUserId;
//# sourceMappingURL=getRewardsByUserId.js.map