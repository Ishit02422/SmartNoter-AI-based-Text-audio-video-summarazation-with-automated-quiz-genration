"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const lodash_1 = require("lodash");
const mongoose_1 = require("mongoose");
class User {
    constructor(input) {
        this._id = (input === null || input === void 0 ? void 0 : input._id)
            ? input === null || input === void 0 ? void 0 : input._id.toString()
            : new mongoose_1.Types.ObjectId().toString();
        this.firstName = input === null || input === void 0 ? void 0 : input.firstName;
        this.lastName = input === null || input === void 0 ? void 0 : input.lastName;
        this.firebaseUserId = input === null || input === void 0 ? void 0 : input.firebaseUserId;
        this.isGoogleLogin = input === null || input === void 0 ? void 0 : input.isGoogleLogin;
        this.isAppleLogin = input === null || input === void 0 ? void 0 : input.isAppleLogin;
        this.password = input === null || input === void 0 ? void 0 : input.password;
        this.profileImage = input === null || input === void 0 ? void 0 : input.profileImage;
        this.generatedSummary = input === null || input === void 0 ? void 0 : input.generatedSummary;
        this.FCMToken = input === null || input === void 0 ? void 0 : input.FCMToken;
        this.token = input.token;
        this.RESETToken = input === null || input === void 0 ? void 0 : input.RESETToken;
        this.userType = input === null || input === void 0 ? void 0 : input.userType;
        this.isEmailVerified = input === null || input === void 0 ? void 0 : input.isEmailVerified;
        this.userType =
            (input === null || input === void 0 ? void 0 : input.userType) === "ADMIN" || (input === null || input === void 0 ? void 0 : input.userType) === "USER"
                ? input === null || input === void 0 ? void 0 : input.userType
                : "USER";
        this.createdAt = input === null || input === void 0 ? void 0 : input.createdAt;
        this.updatedAt = input === null || input === void 0 ? void 0 : input.updatedAt;
        this.glitter = input === null || input === void 0 ? void 0 : input.glitter;
        this.rewardCount = input === null || input === void 0 ? void 0 : input.rewardCount;
        this.viewCount = input === null || input === void 0 ? void 0 : input.viewCount;
        this.deviceId = input === null || input === void 0 ? void 0 : input.deviceId;
        this.isTransferred = input === null || input === void 0 ? void 0 : input.isTransferred;
        this.isCreditEligible = input === null || input === void 0 ? void 0 : input.isCreditEligible;
        this.isRegistered = input === null || input === void 0 ? void 0 : input.isRegistered;
        this.email = input === null || input === void 0 ? void 0 : input.email;
        this.isLogin = input === null || input === void 0 ? void 0 : input.isLogin;
        this.darkMode = input === null || input === void 0 ? void 0 : input.darkMode;
        this.isGuestLogin = input === null || input === void 0 ? void 0 : input.isGuestLogin;
        this.feedBackGiven = input === null || input === void 0 ? void 0 : input.feedBackGiven;
        this.isProUser = input === null || input === void 0 ? void 0 : input.isProUser;
        this.isBlocked = input === null || input === void 0 ? void 0 : input.isBlocked;
        this.isPurchased = input === null || input === void 0 ? void 0 : input.isPurchased;
        this.deviceType = input === null || input === void 0 ? void 0 : input.deviceType;
        this.lastCreditReset = input === null || input === void 0 ? void 0 : input.lastCreditReset;
        this.dailyCredits = input === null || input === void 0 ? void 0 : input.dailyCredits;
        this.premiumExpiryDate = input === null || input === void 0 ? void 0 : input.premiumExpiryDate;
        this.premiumType = input === null || input === void 0 ? void 0 : input.premiumType;
        this.phone = input === null || input === void 0 ? void 0 : input.phone;
        this.bio = input === null || input === void 0 ? void 0 : input.bio;
        this.location = input === null || input === void 0 ? void 0 : input.location;
        this.totalSummaries = input === null || input === void 0 ? void 0 : input.totalSummaries;
    }
    toJSON() {
        return (0, lodash_1.omitBy)(this, lodash_1.isUndefined);
    }
}
exports.User = User;
User.defaults = {
    firebaseUserId: "",
    RESETToken: "",
    FCMToken: [],
    rewardCount: 0,
};
User.adminTypes = ["ADMIN", "SUPER ADMIN"];
//# sourceMappingURL=user.types.js.map