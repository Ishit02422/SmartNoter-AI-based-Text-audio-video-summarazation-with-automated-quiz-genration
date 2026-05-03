import { model, Schema, Types } from "mongoose";
import { IAudio } from "..";
const Audio = new Schema<IAudio>(
  {
    title: {
      type: String,
      default: "",
    },
    audioURL: {
      type: String,
      default: "",
    },
    userId: {
      type: Types.ObjectId,
      ref: "users",
      default: null,
    },
  },
  { timestamps: true }
);

export const AudioModel = model<IAudio>("audio", Audio);
