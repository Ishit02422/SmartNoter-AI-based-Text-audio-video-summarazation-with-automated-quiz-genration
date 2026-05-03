import { model, Schema } from "mongoose";
import { IGeneratedSummaryFromWeb } from "../types";

const GeneratedSummaryFromWeb = new Schema<IGeneratedSummaryFromWeb>(
  {
    actionPoints: [
      {
        type: String,
        default: "",
      },
    ],
    aiResponse: {
      type: String,
      default: "",
      select: false,
    },
    details: {
      type: String,
      default: "",
    },
    folderId: {
      type: Schema.Types.ObjectId,
      ref: "folders",
      default: null,
    },
    quotes: [
      {
        type: String,
        default: "",
      },
    ],
    tags: [
      {
        type: String,
        default: "",
      },
    ],
    keyPoints: [
      {
        type: String,
        default: "",
      },
    ],
    summarization: {
      type: String,
      default: "",
    },
    topic: {
      type: String,
      default: "",
    },
    url: {
      type: String,
      default: "",
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
  },
  { timestamps: true }
);
export const GeneratedSummaryWebModel = model<IGeneratedSummaryFromWeb>(
  "GeneratedSummaryFromWeb",
  GeneratedSummaryFromWeb
);
