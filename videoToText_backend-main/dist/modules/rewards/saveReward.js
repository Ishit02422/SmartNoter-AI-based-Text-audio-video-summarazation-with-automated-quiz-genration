"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveReward = void 0;
const schema_1 = require("./schema");
/**
 *
 * @param reward
 * @returns savedReward
 */
const saveReward = async (reward) => {
    const savedReward = await new schema_1.RewardModel(reward.toJSON()).save();
    return savedReward;
};
exports.saveReward = saveReward;
//# sourceMappingURL=saveReward.js.map