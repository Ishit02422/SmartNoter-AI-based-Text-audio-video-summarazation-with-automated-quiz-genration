import { GeneratedSummary } from ".";
import { GeneratedSummaryModel } from "./schema";

/**
 * function for save generatedSummary in database
 * @param generatedSummary
 * @returns generatedSummary itself
 */
export const saveGeneratedSummary = async (
  generatedSummary: GeneratedSummary
) => {
  const savedGeneratedSummary = await new GeneratedSummaryModel(
    generatedSummary.toJSON()
  ).save();
  return savedGeneratedSummary;
};
