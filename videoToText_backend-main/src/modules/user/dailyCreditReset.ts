import { UserModel } from "./schema";

export const dailyCreditReset = async () => {
  try {
    // Reset Pro users (you can increase this if pro users get more)
    await UserModel.updateMany(
      {isProUser: true,isPurchased: true},
      {
        $set: {
          lastCreditReset: new Date(),
          dailyCredits: 7,
        },
      }
    );
    // Reset free users to 7 credits daily
    await UserModel.updateMany(
      {isProUser: false,isPurchased: false},
      {
        $set: {
          lastCreditReset: new Date(),
          dailyCredits: 7,
        },
      }
    );
  } catch (error) {
    console.error("❌ Error resetting daily credits:", error);
    throw new Error(error.message);
  }
};
