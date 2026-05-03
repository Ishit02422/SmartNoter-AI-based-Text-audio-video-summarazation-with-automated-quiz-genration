import { model, Schema, Types } from "mongoose";
import { IImage } from "..";
const image = new Schema<IImage>(
  {
    description: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      default: "",
    },
    imageURL: {
      type: String,
      default: "",
    },
    thumbnail: {
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

export const ImageModel = model<IImage>("image", image);
