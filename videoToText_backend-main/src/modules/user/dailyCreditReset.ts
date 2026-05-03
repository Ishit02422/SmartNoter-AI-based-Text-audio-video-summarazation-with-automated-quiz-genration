import { UserModel } from "./schema";

export const dailyCreditReset = async () => {
  try {
    await UserModel.updateMany(
      {isProUser: true,isPurchased: true},
      {
        $set: {
          lastCreditReset: new Date(),
          dailyCredits: 50,
        },
      }
    );
    // Disabled free user reset to enforce strict 3 uses lifetime limit
    // await UserModel.updateMany(
    //   {isProUser: false,isPurchased: false},
    //   {
    //     $set: {
    //       lastCreditReset: new Date(),
    //       dailyCredits: 3,
    //     },
    //   }
    // );
  } catch (error) {
    console.error("❌ Error resetting daily credits:", error);
    throw new Error(error.message);
  }
};
