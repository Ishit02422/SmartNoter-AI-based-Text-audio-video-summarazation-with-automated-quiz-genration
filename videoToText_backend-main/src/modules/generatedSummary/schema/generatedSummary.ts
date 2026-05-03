import { model, Schema, Types } from "mongoose";
import { IGeneratedSummary } from "..";
const GeneratedSummary = new Schema<IGeneratedSummary>(
  {
    summary_duration: {
      type: String,
      default: "",
    },
    duration: {
      type: String,
      default: "",
    },
    language: {
      type: String,
      default: "",
    },
    model: {
      type: String,
      default: "",
    },
    audioUrl: {
      type: String,
      default: "",
    },
    summaryId: {
      type: String,
      default: "",
    }, // id given by assemblyai after creating avatar
    userId: {
      type: Types.ObjectId,
      ref: "users",
      default: null,
    },
    imageId: {
      type: Types.ObjectId,
      ref: "image",
      default: null,
    },
    transcript: {
      type: String,
      default: "",
    },
    summarization: {
      type: String,
      default: "",
    },
    content_moderation: [
      {
        type: String,
        default: "",
      },
    ],
    sentiment_nalysis: [
      {
        type: String,
        default: "",
      },
    ],
    entity_detection: [
      {
        type: String,
        default: "",
      },
    ],
    topic_detection: [
      {
        type: String,
        default: "",
      },
    ],
    auto_chapters: [
      {
        type: String,
        default: "",
      },
    ],
    key_phrases: [
      {
        type: String,
        default: "",
      },
    ],
    pii_redaction: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export const GeneratedSummaryModel = model<IGeneratedSummary>(
  "GeneratedSummary",
  GeneratedSummary
);
