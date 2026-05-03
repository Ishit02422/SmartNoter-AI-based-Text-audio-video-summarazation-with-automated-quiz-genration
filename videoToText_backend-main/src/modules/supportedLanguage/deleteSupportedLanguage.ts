import { SupportedLanguageModel } from "./schema";

/**
 *
 * @param supportedLanguage supportedLanguage class
 */
export const deleteSupportedLanguage = async (supportedLanguageId: string) => {
  await SupportedLanguageModel.findByIdAndDelete(supportedLanguageId);
};
