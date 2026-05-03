import { GeneratedSummaryAudioModel } from "./schema";
import { IGeneratedSummaryAudio } from "./types";
/**
 *
 * @param summaryId
 * @param data
 * @returns editedSummary
 */
export const updateAudioSummary = async (
  summaryId: string,
  data: IGeneratedSummaryAudio
) => {
  const editedSummary = await GeneratedSummaryAudioModel.findByIdAndUpdate(
    summaryId,
    data,
    { new: true }
  );
  return editedSummary;
};
