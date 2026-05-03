import mongoose, { model, Schema } from "mongoose";
import { IChatWithAi } from "../types";

const ChatWithAi = new Schema<IChatWithAi>(
  {
    content: {
      type: String,
      default: "",
    },
    contextId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    messageType: {
      type: String,
      required: true,
      enum: ["ai", "human"],
    },
    source: {
      type: String,
      enum: ["pdf", "audio", "video", "web", "text"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  },
  { timestamps: true }
);

export const ChatWithAiModel = model<IChatWithAi>("ChatWithAi", ChatWithAi);
