import { model, Schema, Types } from "mongoose";
import { ISupportedLanguage } from "..";
const supportedLanguage = new Schema<ISupportedLanguage>(
  {
    country: {
      type: String,
      default: "",
    },
    flag: {
      type: String,
      // ref: "image",
      default: "",
    },
    codeForText: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export const SupportedLanguageModel = model<ISupportedLanguage>(
  "supportedLanguage",
  supportedLanguage
);
