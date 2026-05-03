import { GenerateSummyPdfModel } from "./schema";
/**
 *
 * @param userId
 * @returns summaries
 */
export const getAllAudioSummary = async (userId: string) => {
  const summaries = await GenerateSummyPdfModel.find({ userId });
  return summaries;
};
