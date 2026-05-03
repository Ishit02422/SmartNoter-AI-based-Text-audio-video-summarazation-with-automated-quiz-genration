import { GeneratedSummaryTextModel } from "./schema";
import { IGenerateSummaryText } from "./types";
/**
 *
 * @param summaryId
 * @param data
 * @returns editedSummary
 */
export const updateTextSummary = async (
  summaryId: string,
  data: IGenerateSummaryText
) => {
  const editedSummary = await GeneratedSummaryTextModel.findByIdAndUpdate(
    summaryId,
    data,
    { new: true }
  );
  return editedSummary;
};
