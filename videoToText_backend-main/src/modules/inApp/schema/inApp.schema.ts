import { Schema, model, Types } from "mongoose";
import { IInApp } from "../types/inApp.types";
const inApp = new Schema<IInApp>(
  {
    receiptId: { type: String },
    userId: { type: Types.ObjectId, ref: "users", default: null },
    data: { type: String },
    glitter: {
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
    premiumType: {
      type: String,
      default: "FREE",
    },
    detail: {
      environment: {
        type: String,
        default: "",
      },
      latestReceipt: { type: String, default: "" },
      latestData: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

export const inAppModel = model<IInApp>("inApp", inApp);
