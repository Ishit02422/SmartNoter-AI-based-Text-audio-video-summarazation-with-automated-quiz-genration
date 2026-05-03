import { GeneratedSummaryWebModel } from "./schema";
/**
 *
 * @param summaryId
 */
export const deletedSummary = async (summaryId: string) => {
  const deletedSummary = await GeneratedSummaryWebModel.findByIdAndDelete(
    summaryId
  );
  return deletedSummary;
};
