import { GenerateSummyPdfModel } from "./schema";
import { IGenerateSummaryPdf } from "./types";
/**
 *
 * @param summaryId
 * @param data
 * @returns editedSummary
 */
export const updatePdfSummary = async (
  summaryId: string,
  data: IGenerateSummaryPdf
) => {
  const editedSummary = await GenerateSummyPdfModel.findByIdAndUpdate(
    summaryId,
    data,
    { new: true }
  );
  return editedSummary;
};
