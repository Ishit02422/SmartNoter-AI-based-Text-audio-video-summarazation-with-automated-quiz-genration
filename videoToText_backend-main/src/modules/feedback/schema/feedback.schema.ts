import { Schema, model, Types } from "mongoose";
import { IFeedback } from "../types";

const feedback = new Schema<IFeedback>(
  {
    email: {
      type: String,
      default: "",
    },
    deviceId: {
      type: String,
      default: "",
    },
    appVersion: {
      type: String,
      default: "",
    },
    deviceName: {
      type: String,
      default: "",
    },
    deviceVersion: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    option1: {
      type: String,
      default: "",
    },
    option2: {
      type: String,
      default: "",
    },
    option3: {
      type: String,
      default: "",
    },
    option4: {
      type: String,
      default: "",
    },
    comment: {
      type: String,
      default: "",
    },
    buildNumber: {
      type: String,
      default: "",
    },
    // feedback: [
    //   {
    //     question: {
    //       type: String,
    //       default: "",
    //     },
    //     answer: {
    //       type: String,
    //       default: "",
    //     },
    //   },
    // ],
    userId: {
      type: Types.ObjectId,
      ref: "users",
      default: "",
    },
  },
  { timestamps: true }
);

export const FeedbackModel = model<IFeedback>("feedback", feedback);
