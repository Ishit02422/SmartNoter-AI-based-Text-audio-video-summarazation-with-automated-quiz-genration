import { SupportedLanguage } from "./types";
import { SupportedLanguageModel } from "./schema";

/**
 *
 * @param name supportedLanguage name
 * @returns relevant category record | null
 */
export const getAllSupportedLanguage = async () => {
  const supportedLanguage = await SupportedLanguageModel.find().populate({
    path: "flag",
  });
  return supportedLanguage
    ? supportedLanguage.map((item) => new SupportedLanguage(item))
    : null;
};
