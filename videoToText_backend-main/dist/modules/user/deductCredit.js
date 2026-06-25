"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deductCreditFromUserAccount = void 0;
const schema_1 = require("./schema");
const deductCreditFromUserAccount = async (userId) => {
    try {
        const user = await schema_1.UserModel.findById(userId);
        if (!user) {
            throw new Error(`User does not exists`);
        }
        if (user.isProUser && user.isPurchased) {
            const now = new Date();
            if (user.premiumExpiryDate && user.premiumExpiryDate < now) {
                throw new Error("Your premium version has expired, please renew.");
            }
            return;
        }
        else {
            await schema_1.UserModel.updateOne({
                _id: userId,
                dailyCredits: { $gt: 0 },
            }, {
                $inc: { dailyCredits: -1 },
            });
            // Silently continue even if no credits left (unlimited mode)
        }
    }
    catch (error) {
        throw new Error(`Error: ${error.message}`);
    }
};
exports.deductCreditFromUserAccount = deductCreditFromUserAccount;
//# sourceMappingURL=deductCredit.js.map