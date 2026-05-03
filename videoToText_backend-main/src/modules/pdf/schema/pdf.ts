import { model, Schema, Types } from "mongoose";
import { IPdf } from "../types";
const PDF = new Schema<IPdf>(
  {
    title: {
      type: String,
      default: "",
    },
    pdfURL: {
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

export const PdfModel = model<IPdf>("pdf", PDF);
