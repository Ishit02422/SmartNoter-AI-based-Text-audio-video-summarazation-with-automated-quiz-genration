import { Types } from "mongoose";
import { UserModel } from "./schema";
import { saveReward, Reward } from "../rewards";

/**
 * Deducts credit and adds a reward point for successful activity
 */
export const deductCreditAndAddReward = async (
  userId: string | Types.ObjectId,
  activityType: string = "SUMMARY_GENERATION"
) => {
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error(`User does not exist`);
    }

    // 1. Credit Deduction Logic
    if (!(user.isProUser && user.isPurchased)) {
       await UserModel.updateOne(
        { _id: userId, dailyCredits: { $gt: 0 } },
        { $inc: { dailyCredits: -1 } }
      );
    }

    // 2. Reward Logic
    const rewardAmount = 2; // +2 points for each summary
    
    // Increment the user's reward count
    await UserModel.updateOne(
      { _id: userId },
      { $inc: { rewardCount: rewardAmount } }
    );

    // Save a log entry in the rewards collection
    await saveReward(
      new Reward({
        userId: userId as Types.ObjectId,
        type: activityType,
        credit: rewardAmount,
        status: "APPROVED",
      })
    );

    console.log(`Rewarding user ${userId}: +${rewardAmount} points for ${activityType}`);

  } catch (error: any) {
    console.error(`Error in deductCreditAndAddReward: ${error.message}`);
    // We don't throw here to avoid failing the whole generation process if rewarding fails
  }
};
