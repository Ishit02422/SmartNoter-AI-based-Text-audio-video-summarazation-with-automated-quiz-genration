import { GeneratedSummaryFromWeb } from ".";
import { GeneratedSummaryWebModel } from "./schema";
/**
 * function for save summary data store in database
 * @params generatedData
 * @returns generatedData itself
 */
export const saveGeneratedSummaryFromWeb = async (
  generatedData: GeneratedSummaryFromWeb
) => {
  const savedSummaryData = await new GeneratedSummaryWebModel(
    generatedData.toJSON()
  ).save();
  return savedSummaryData;
};
