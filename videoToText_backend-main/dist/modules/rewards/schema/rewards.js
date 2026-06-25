"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RewardModel = void 0;
const mongoose_1 = require("mongoose");
const Reward = new mongoose_1.Schema({
    credit: {
        type: Number,
        default: 0,
    },
    referralCode: {
        type: String,
        default: "",
    },
    refersUser: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "users" }],
    rewardBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "users",
        required: false,
    },
    status: {
        type: String,
        enum: ["PENDING", "APPROVED", "REJECTED"],
        default: "PENDING",
    },
    token: {
        type: Number,
        default: 0,
    },
    postLink: {
        type: String,
        default: ""
    },
    type: {
        type: String,
        enum: [
            "PLAY_STORE_REVIEW",
            "INSTAGRAM_POST",
            "REFERRAL",
            "REFER_EARN",
            "VIDEO_WATCH",
            "DAILY_CHECKIN",
        ],
        default: "REFER_EARN"
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "users",
        required: false,
    },
    count: {
        type: Number,
        required: false,
    },
}, { timestamps: true });
exports.RewardModel = (0, mongoose_1.model)("Reward", Reward);
//# sourceMappingURL=rewards.js.map