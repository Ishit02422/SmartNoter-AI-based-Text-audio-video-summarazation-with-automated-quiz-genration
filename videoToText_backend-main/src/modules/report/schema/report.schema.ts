import { Schema, model, Types } from "mongoose";
import { IReport } from "../types";

const report = new Schema<IReport>(
  {
    reason: {
      type: String,
    },
    generatedSummaryId: {
      type: Types.ObjectId,
      ref: "generatedSummary",
      default: null,
    },
    reportedBy: {
      type: Types.ObjectId,
      ref: "users",
      default: null,
    },
  },
  { timestamps: true }
);

export const ReportModel = model<IReport>("report", report);
