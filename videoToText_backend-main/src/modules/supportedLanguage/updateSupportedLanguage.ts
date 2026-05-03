import { SupportedLanguage } from ".";
import { SupportedLanguageModel } from "./schema";

/**
 * function for save supportedLanguage in database
 * @param supportedLanguage
 * @returns supportedLanguage itself
 */
export const updateSupportedLanguage = async (
  supportedLanguage: SupportedLanguage
) => {
  await SupportedLanguageModel.findByIdAndUpdate(
    supportedLanguage._id,
    supportedLanguage.toJSON()
  );
  return supportedLanguage;
};
