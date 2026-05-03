import { GeneratedSummaryModel } from "./schema";
/**
 *
 * @param summaryId
 */
export const deletedSummary = async (summaryId: string) => {
  const deletedSummary = await GeneratedSummaryModel.findByIdAndDelete(
    summaryId
  );
  return deletedSummary;
};
