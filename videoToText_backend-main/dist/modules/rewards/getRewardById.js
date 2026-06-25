"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRewardById = void 0;
const schema_1 = require("./schema");
const getRewardById = async (id) => {
    const reward = await schema_1.RewardModel.findById(id);
    return reward;
};
exports.getRewardById = getRewardById;
//# sourceMappingURL=getRewardById.js.map