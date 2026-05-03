import { GeneratedSummaryWebModel } from "./schema";
import { IGeneratedSummaryFromWeb } from "./types";
/**
 *
 * @param summaryId
 * @param data
 * @returns editedSummary
 */
export const updateWebSummary = async (
  summaryId: string,
  data: IGeneratedSummaryFromWeb
) => {
  const editedSummary = await GeneratedSummaryWebModel.findByIdAndUpdate(
    summaryId,
    data,
    { new: true }
  );
  return editedSummary;
};
