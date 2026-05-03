import { model, Schema } from "mongoose";
import { IGenerateSummaryText } from "../types";

const GeneratedSummaryFromText = new Schema<IGenerateSummaryText>(
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
      select:false,
    },

    folderId: {
      type: Schema.Types.ObjectId,
      ref: "folders",
      default: null,
    },
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
    title: {
      type: String,
      default: "",
    },
    text: {
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
export const GeneratedSummaryTextModel = model<IGenerateSummaryText>(
  "GeneratedSummaryFromText",
  GeneratedSummaryFromText
);
