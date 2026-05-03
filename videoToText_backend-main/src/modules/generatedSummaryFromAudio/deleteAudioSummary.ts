import { GeneratedSummaryAudioModel } from "./schema";
/**
 *
 * @param summaryId
 */
export const deletedSummary = async (summaryId: string) => {
  const deletedSummary = await GeneratedSummaryAudioModel.findByIdAndDelete(
    summaryId
  );
  return deletedSummary;
};
