import mongoose, { model, Schema } from "mongoose";
import { ITranslate } from "../types";

const TranslateSchema = new Schema<ITranslate>(
  {
    originalSummary: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      default: "",
    },
    source: {
      type: String,
      enum: ["video", "audio", "pdf", "web", "text"],
      default: "",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: null,
    },
    summaryId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    translatedLanguage: {
      type: mongoose.Schema.Types.Mixed,
      default: "",
    },
    translatedSummary: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);
export const TranslateModel = model<ITranslate>("Translate", TranslateSchema);
