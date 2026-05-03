import { GeneratedSummaryAudioModel } from "./schema";
/**
 *
 * @param userId
 * @returns summaries
 */
export const getAllAudioSummary = async (userId: string) => {
  const summaries = await GeneratedSummaryAudioModel.find({ userId });
  return summaries;
};
