import { model, Schema, Types } from "mongoose";
import { ISubscription } from "../types";

const subscription = new Schema<ISubscription>(
  {
    receiptId: { type: String, default: "" },
    userId: { type: Types.ObjectId, ref: "users", default: null },
    data: { type: String, default: "" },
    Coins: {
      type: Number,
      default: 0,
    },
    deviceId: {
      type: String,
      default: "",
    },
    appType: {
      type: String,
      default: "",
    },
    price: {
      type: String,
      default: "",
    },
    store: {
      type: String,
      default: "",
    },
    purchase: {
      type: String,
      default: "",
    },
    detail: {
      type: Object,
      default: null,
    },
    expiredTime: {
      type: String,
      default: "",
    },
    subscriptionType: {
      type: String,
      default: "",
    },
    originalTransactionId: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);
export const SubscriptionModel = model<ISubscription>("subscription", subscription);