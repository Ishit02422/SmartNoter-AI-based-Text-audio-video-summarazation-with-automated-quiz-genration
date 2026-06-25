"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUserPremium = void 0;
const http_status_codes_1 = require("http-status-codes");
const validateUserPremium = async (req, res, next) => {
    const authUser = req.authUser;
    try {
        if (authUser.userType === "USER") {
            if (authUser.isProUser && authUser.isPurchased) {
                const now = new Date();
                if (authUser.premiumExpiryDate && authUser.premiumExpiryDate < now) {
                    return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                        message: "Your premium version has expired, please renew.",
                    });
                }
                return next();
            }
            // Credits check disabled — unlimited credits for all users
            // if (authUser.dailyCredits <= 0) {
            //   return res.status(StatusCodes.BAD_REQUEST).json({
            //     message: "You have no credits left for today.",
            //   });
            // }
        }
        next();
    }
    catch (error) {
        console.error("❌ Error in validateUserPremium:", error.message);
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Something went wrong, try again later.",
            error: error.message,
        });
    }
};
exports.validateUserPremium = validateUserPremium;
//# sourceMappingURL=validateUserPremium.js.map