import { GenerateSummyPdfModel } from "./schema";
/**
 *
 * @param summaryId
 */
export const deletedSummary = async (summaryId: string) => {
  const deletedSummary = await GenerateSummyPdfModel.findByIdAndDelete(
    summaryId
  );
  return deletedSummary;
};
