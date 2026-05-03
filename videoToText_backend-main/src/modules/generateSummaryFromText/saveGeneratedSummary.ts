import { GenerateSummaryText } from ".";
import { GeneratedSummaryTextModel } from "./schema";
/**
 * function for save summary data store in database
 * @params generatedData
 * @returns generatedData itself
 */
export const saveGeneratedSummaryFromText = async (
  generatedData: GenerateSummaryText
) => {
  const savedSummaryData = await new GeneratedSummaryTextModel(
    generatedData.toJSON()
  ).save();
  return savedSummaryData;
};
