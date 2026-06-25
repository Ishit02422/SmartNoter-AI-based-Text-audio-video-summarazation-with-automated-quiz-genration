"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getByReferCode = void 0;
const schema_1 = require("./schema");
const getByReferCode = async (referralCode, type) => {
    const reward = await schema_1.RewardModel.findOne({ referralCode, type });
    return reward;
};
exports.getByReferCode = getByReferCode;
//# sourceMappingURL=getByReferCode.js.map