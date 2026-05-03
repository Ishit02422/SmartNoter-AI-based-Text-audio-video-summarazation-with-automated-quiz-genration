import { model, Schema, Types } from "mongoose";
import { IVideo } from "..";
const Video = new Schema<IVideo>(
  {
    title: {
      type: String,
      default: "",
    },
    videoURL: {
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

export const VideoModel = model<IVideo>("Video", Video);
