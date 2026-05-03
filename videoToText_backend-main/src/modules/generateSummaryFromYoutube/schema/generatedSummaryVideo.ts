import mongoose, { model, Schema, Types } from "mongoose";
import { IGeneratedSummaryVideo } from "../types";
const GeneratedSummaryVideo = new Schema<IGeneratedSummaryVideo>(
  {
    sourceType: {
      type: String,
      enum: ["youtube", "upload"],
      required: true,
    },
    language: {
      type: String,
      default: "",
    },
    aiResponse: {
      type: String,
      select:false,
      default: "",
      // select: false,
    },
    summary_types: {
      type: String,
      enum: ["bullets", "bullets_verbose", "gist", "headline", "paragraph"],
    },
    summary_models: {
      type: String,
      enum: ["informative", "conversational", "catchy"],
    },
    model: {
      type: String,
      default: "summarization",
    },
    videoUrl: {
      type: String,
      default: "",
    },
    videoId: {
      type: String,
      default: "",
    },
    folderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "folders",
      default: null,
    },
    userId: {
      type: Types.ObjectId,
      ref: "users",
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
    title: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export const GeneratedSummaryModel = model<IGeneratedSummaryVideo>(
  "GeneratedSummaryVideo",
  GeneratedSummaryVideo
);
