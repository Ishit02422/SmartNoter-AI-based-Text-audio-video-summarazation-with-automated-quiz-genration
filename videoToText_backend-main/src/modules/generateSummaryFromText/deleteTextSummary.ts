import { GeneratedSummaryTextModel } from "./schema";
/**
 *
 * @param summaryId
 */
export const deletedSummary = async (summaryId: string) => {
  const deletedSummary = await GeneratedSummaryTextModel.findByIdAndDelete(
    summaryId
  );
  return deletedSummary;
};
