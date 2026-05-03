import { GeneratedSummaryVideo } from ".";
import { GeneratedSummaryModel } from "./schema";
/**
 * function for save summary data store in database
 * @params generatedData
 * @returns generatedData itself
 */
export const saveGeneratedSummaryFromYoutube = async (
  generatedData: GeneratedSummaryVideo
) => {
  const savedSummaryData = await new GeneratedSummaryModel(
    generatedData.toJSON()
  ).save();
  return savedSummaryData
};
