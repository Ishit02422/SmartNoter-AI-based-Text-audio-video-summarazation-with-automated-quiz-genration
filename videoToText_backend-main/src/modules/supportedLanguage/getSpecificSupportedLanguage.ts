import { SupportedLanguage } from "./types";
import { SupportedLanguageModel } from "./schema";

/**
 *
 * @param name supportedLanguage name
 * @returns relevant category record | null
 */
export const getSpecificSupportedLanguage = async (query: object) => {
  const supportedLanguage = await SupportedLanguageModel.find(query);
  return supportedLanguage
    ? supportedLanguage.map((item) => new SupportedLanguage(item))
    : null;
};
