import mongoose from "mongoose";
import { IGenerateSummaryPdf } from "../types";
import { Types } from "youtubei.js/agnostic";

const GenerateSummaryPDF = new mongoose.Schema<IGenerateSummaryPdf>(
  {
    keyPoints: [
      {
        type: String,
        default: "",
      },
    ],
    actionPoints: [
      {
        type: String,
        default: "",
      },
    ],
    language: {
      type: String,
      default: "en",
    },
    aiResponse: {
      type: String,
      default: "",
      select:false,
    },
    pdfUrl: {
      type: String,
      default: "",
    },
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "pdfs",
      default: null,
    },
    folderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "folders",
      default: null,
    },
    summarization: {
      type: String,
      default: "",
    },
    summary_type: {
      type: String,
      default: "bullets",
    },
    title: {
      type: String,
      default: "",
    },
    transcript: {
      type: String,
      default: "",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: null,
    },
  },
  { timestamps: true }
);
export const GenerateSummyPdfModel = mongoose.model<IGenerateSummaryPdf>(
  "GenerateSummaryPDF",
  GenerateSummaryPDF
);
