import { GenerateSummyPdfModel } from "./schema";
import { GeneratedSummaryPDF } from ".";

/**
 * function for save summary data store in database
 * @params generatedData
 * @returns generatedData itself
 */
export const saveGeneratedSummaryFromPDF = async (
  generatedData: GeneratedSummaryPDF
) => {
  const savedGeneratedSummary = await GenerateSummyPdfModel.create(
    generatedData
  );
  return savedGeneratedSummary;
};
