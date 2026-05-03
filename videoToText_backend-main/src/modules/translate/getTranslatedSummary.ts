import { Types } from "mongoose";
import { TranslateModel } from "./schema";

export const getTranslatedSummary = async (
  summaryId: string,
  source: string,
  language: string,
  userId: string | Types.ObjectId
) => {
  const result = await TranslateModel.findOne({
    summaryId,
    source,
    translatedLanguage: language,
    userId,
  });
  return result;
};
