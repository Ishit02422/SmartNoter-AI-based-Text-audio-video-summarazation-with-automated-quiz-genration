import mongoose, { model, Schema } from "mongoose";
import { IHistory, modelNames } from "../types";

const History = new Schema<IHistory>(
  {
    modelId: [
      {
        type: Schema.Types.ObjectId,
        default: "",
        refPath: "modelName",
      },
    ],
    modelName: {
      type: String,
      default: "",
      enum: modelNames,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
  },
  { timestamps: true }
);
export const HistoryModel = model<IHistory>("History", History);
