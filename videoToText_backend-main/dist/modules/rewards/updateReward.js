"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateReward = void 0;
const schema_1 = require("./schema");
const updateReward = async (id, data) => {
    const saved = await schema_1.RewardModel.findByIdAndUpdate(id, data, {
        new: true,
        upsert: true,
    });
    return saved;
};
exports.updateReward = updateReward;
//# sourceMappingURL=updateReward.js.map