import { GeneratedSummaryModel } from "./schema";
import { IGeneratedSummaryVideo } from "./types";
/**
 *
 * @param summaryId
 * @param data
 * @returns editedSummary
 */
export const updateVideoSummary = async (
  summaryId: string,
  data: IGeneratedSummaryVideo
) => {
  const editedSummary = await GeneratedSummaryModel.findByIdAndUpdate(
    summaryId,
    data,
    { new: true }
  );
  return editedSummary;
};
