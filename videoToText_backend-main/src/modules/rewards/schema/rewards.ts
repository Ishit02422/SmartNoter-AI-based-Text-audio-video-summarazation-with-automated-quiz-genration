import { model, Schema } from "mongoose";
import { IReward } from "../types";

const Reward = new Schema<IReward>(
  {
    credit: {
      type: Number,
      default: 0,
    },
    referralCode: {
      type: String,
      default: "",
    },
    refersUser: [{ type: Schema.Types.ObjectId, ref: "users" }],
    rewardBy: {
      type: Schema.Types.ObjectId,
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
      type: Schema.Types.ObjectId,
      ref: "users",
      required: false,
    },
    count: {
      type: Number,
      required: false,
    },
  },
  { timestamps: true }
);
export const RewardModel = model<IReward>("Reward", Reward);
