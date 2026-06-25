"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
const user = new mongoose_1.Schema({
    firstName: {
        type: String,
        required: false,
    },
    lastName: {
        type: String,
        required: false,
    },
    firebaseUserId: {
        type: String,
        default: "",
    },
    token: {
        type: String,
        default: null,
    },
    isGoogleLogin: {
        type: Boolean,
        default: false,
    },
    isAppleLogin: {
        type: Boolean,
        default: false,
    },
    profileImage: {
        type: mongoose_1.Types.ObjectId,
        ref: "image",
        // default: "6517fffdcb17f60195289ef7",//live
        // default: "6517fffdcb17f60195289ef7", //local
    },
    generatedSummary: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "generatedSummary",
            default: null,
        },
    ],
    FCMToken: [
        {
            type: String,
        },
    ],
    RESETToken: {
        type: String,
        default: "",
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    userType: {
        type: String,
        default: "USER",
    },
    password: {
        type: String,
        default: "",
    },
    glitter: {
        type: Number,
        default: 3,
    },
    viewCount: {
        type: Number,
        default: 0,
    },
    deviceId: {
        type: String,
        default: "",
    },
    isRegistered: {
        type: Boolean,
        default: false,
    },
    email: {
        type: String,
        default: "",
    },
    isLogin: {
        type: Boolean,
        default: false,
    },
    isGuestLogin: {
        type: Boolean,
        default: false,
    },
    feedBackGiven: {
        type: Boolean,
        default: false,
    },
    darkMode: {
        type: Boolean,
        default: false,
    },
    isProUser: {
        type: Boolean,
        default: false,
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    isPurchased: {
        type: Boolean,
        default: false,
    },
    deviceType: {
        type: String,
        default: "",
    },
    isTransferred: {
        type: Boolean,
        default: false,
    },
    isCreditEligible: {
        type: Boolean,
        default: false,
    },
    dailyCredits: {
        type: Number,
        default: 3,
    },
    rewardCount: {
        type: Number,
        default: 0,
    },
    lastCreditReset: {
        type: Date,
        default: Date.now,
    },
    premiumExpiryDate: {
        type: Date,
        default: null,
    },
    premiumType: {
        type: String,
        enum: ["YEARLY", "MONTHLY", "WEEKLY", "QUATERLY", "DAILY", "FREE"],
        default: "FREE",
    },
    phone: {
        type: String,
        default: "",
    },
    bio: {
        type: String,
        default: "",
    },
    location: {
        type: String,
        default: "",
    },
}, { timestamps: true });
exports.UserModel = (0, mongoose_1.model)("users", user);
//# sourceMappingURL=user.schema.js.map