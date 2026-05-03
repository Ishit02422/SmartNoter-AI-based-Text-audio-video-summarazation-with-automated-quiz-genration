import mongoose, { model, Schema, Types } from "mongoose";
import { IGeneratedSummaryAudio } from "../types";

const GenerateSummaryAudio = new mongoose.Schema<IGeneratedSummaryAudio>(
  {
    title: {
      type: String,
      default: "",
    },
    folderId: {
      type: Schema.Types.ObjectId,
      ref: "folders",
      default: null,
    },
    duration: {
      type: String,
      default: "",
    },
    summary_type: {
      type: String,
      default: "",
    },
    aiResponse: {
      type: String,
      select: false,
      default: "",
      // select:false,
    },
    language: {
      type: String,
      default: "",
    },
    model: {
      type: String,
      default: "",
    },
    summary_models: {
      type: String,
      default: "",
    },
    audioUrl: {
      type: String,
      default: "",
    },
    transcriptId: {
      type: String,
      default: "",
    }, // id given by assemblyai after creating avatar
    userId: {
      type: Types.ObjectId,
      ref: "users",
      default: null,
    },
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "audios",
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
    keyPoints: [
      {
        type: String,
        default: "",
      },
    ],
  },
  { timestamps: true }
);

export const GeneratedSummaryAudioModel = model<IGeneratedSummaryAudio>(
  "GeneratedSummaryAudio",
  GenerateSummaryAudio
);
