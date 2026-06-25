"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dailyCreditReset = void 0;
const schema_1 = require("./schema");
const dailyCreditReset = async () => {
    try {
        await schema_1.UserModel.updateMany({ isProUser: true, isPurchased: true }, {
            $set: {
                lastCreditReset: new Date(),
                dailyCredits: 50,
            },
        });
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
    }
    catch (error) {
        console.error("❌ Error resetting daily credits:", error);
        throw new Error(error.message);
    }
};
exports.dailyCreditReset = dailyCreditReset;
//# sourceMappingURL=dailyCreditReset.js.map