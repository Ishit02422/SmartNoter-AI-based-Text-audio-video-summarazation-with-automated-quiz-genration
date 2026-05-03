import { SupportedLanguage } from ".";
import { SupportedLanguageModel } from "./schema";

/**
 * function for save supportedLanguage in database
 * @param supportedLanguage
 * @returns supportedLanguage itself
 */
export const saveSupportedLanguage = async (
  supportedLanguage: SupportedLanguage
) => {
  const data = await new SupportedLanguageModel(
    supportedLanguage.toJSON()
  ).save();
  return data;
};
