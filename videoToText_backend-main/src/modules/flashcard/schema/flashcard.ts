import mongoose, { Schema } from "mongoose";
import { IFlashCard } from "../types";

const FlashCard = new Schema<IFlashCard>(
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
    imageUrl: {
      type: String,
      default: "",
    },
    que: {
      type: String,
      default: "",
    },
    ans: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export const FlashCardModel = mongoose.model<IFlashCard>(
  "FlashCard",
  FlashCard
);
