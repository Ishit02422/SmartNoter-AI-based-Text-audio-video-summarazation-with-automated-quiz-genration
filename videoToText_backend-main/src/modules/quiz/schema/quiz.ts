import mongoose, { Schema } from "mongoose";
import { IQuiz } from "../types";

const Quiz = new Schema<IQuiz>(
  {
    summaryId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    source: {
      type: String,
      enum: ["pdf", "audio", "video", "web", "text"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    que: {
      type: String,
      default: "",
    },
    options: {
      A: {
        type: String,
        default: "",
      },
      B: {
        type: String,
        default: "",
      },
      C: {
        type: String,
        default: "",
      },
      D: {
        type: String,
        default: "",
      },
    },
    correctOption: {
      type: String,
      default: null,
    },
    isAnswered: {
      type: Boolean,
      default: false,
    },
    answeredOption: {
      type: String,
      default: null,
    },
    resultStatus: {
      type: String,
      enum: ["RIGHT", "WRONG"],
      default: null,
    },
  },
  { timestamps: true }
);

export const QuizModel = mongoose.model<IQuiz>("Quiz", Quiz);
