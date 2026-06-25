"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkCreditLimit = void 0;
const user_schema_1 = require("../modules/user/schema/user.schema");
const checkCreditLimit = async (req, res, next) => {
    try {
        const authUser = req.authUser;
        if (!authUser)
            return next();
        const user = await user_schema_1.UserModel.findById(authUser._id);
        if (!user)
            return next();
        if (!(user.isProUser && user.isPurchased)) {
            if (user.dailyCredits <= 0) {
                return res.status(402).json({ message: "INSUFFICIENT_CREDITS" });
            }
        }
        next();
    }
    catch (error) {
        next();
    }
};
exports.checkCreditLimit = checkCreditLimit;
//# sourceMappingURL=checkCreditLimit.js.map