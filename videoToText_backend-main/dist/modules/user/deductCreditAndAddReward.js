"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deductCreditAndAddReward = void 0;
const schema_1 = require("./schema");
const rewards_1 = require("../rewards");
/**
 * Deducts credit and adds a reward point for successful activity
 */
const deductCreditAndAddReward = async (userId, activityType = "SUMMARY_GENERATION") => {
    try {
        const user = await schema_1.UserModel.findById(userId);
        if (!user) {
            throw new Error(`User does not exist`);
        }
        // 1. Credit Deduction Logic
        if (!(user.isProUser && user.isPurchased)) {
            await schema_1.UserModel.updateOne({ _id: userId, dailyCredits: { $gt: 0 } }, { $inc: { dailyCredits: -1 } });
        }
        // 2. Reward Logic
        const rewardAmount = 2; // +2 points for each summary
        // Increment the user's reward count
        await schema_1.UserModel.updateOne({ _id: userId }, { $inc: { rewardCount: rewardAmount } });
        // Save a log entry in the rewards collection
        await (0, rewards_1.saveReward)(new rewards_1.Reward({
            userId: userId,
            type: activityType,
            credit: rewardAmount,
            status: "APPROVED",
        }));
        console.log(`Rewarding user ${userId}: +${rewardAmount} points for ${activityType}`);
    }
    catch (error) {
        console.error(`Error in deductCreditAndAddReward: ${error.message}`);
        // We don't throw here to avoid failing the whole generation process if rewarding fails
    }
};
exports.deductCreditAndAddReward = deductCreditAndAddReward;
//# sourceMappingURL=deductCreditAndAddReward.js.map