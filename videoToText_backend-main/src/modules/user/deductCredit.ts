import { Types } from "mongoose";
import { UserModel } from "./schema";

export const deductCreditFromUserAccount = async (
  userId: string | Types.ObjectId
) => {
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error(`User does not exists`);
    }
    if (user.isProUser && user.isPurchased) {
      const now = new Date();
      if (user.premiumExpiryDate && user.premiumExpiryDate < now) {
        throw new Error("Your premium version has expired, please renew.");
      }
      return;
    } else {
      await UserModel.updateOne(
        {
          _id: userId,
          dailyCredits: { $gt: 0 },
        },
        {
          $inc: { dailyCredits: -1 },
        }
      );
      // Silently continue even if no credits left (unlimited mode)
    }
  } catch (error) {
    throw new Error(`Error: ${error.message}`);
  }
};
