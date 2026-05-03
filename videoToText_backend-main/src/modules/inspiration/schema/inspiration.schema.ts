import { Schema, model, Types } from "mongoose";
import { IInspiration } from "../types/inspiration.types";
const inspiration = new Schema<IInspiration>(
  {
    generatedSummaryId: {
      type: Types.ObjectId,
      ref: "GeneratedSummary",
      default: null,
    },
    category: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export const inspirationModel = model<IInspiration>("inspiration", inspiration);
