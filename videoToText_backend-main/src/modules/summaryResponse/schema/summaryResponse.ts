import mongoose from "mongoose";
import { ISummaryResponse } from "../types";

const SummaryResponse = new mongoose.Schema<ISummaryResponse>(
  {
    response: {
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
  },
  { timestamps: true }
);
export const SummaryResponseModel = mongoose.model<ISummaryResponse>(
  "SummaryResponse",
  SummaryResponse
);
