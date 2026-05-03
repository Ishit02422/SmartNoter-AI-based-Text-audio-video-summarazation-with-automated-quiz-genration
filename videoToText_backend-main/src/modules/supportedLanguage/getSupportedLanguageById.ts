import { SupportedLanguage } from ".";
import { SupportedLanguageModel } from "./schema";

/**
 *
 * @param _id
 * @returns relevant supportedLanguage
 */
export const getSupportedLanguageById = async (_id: string) => {
  const supportedLanguage = await SupportedLanguageModel.findById(_id);
  return supportedLanguage ? new SupportedLanguage(supportedLanguage) : null;
};
