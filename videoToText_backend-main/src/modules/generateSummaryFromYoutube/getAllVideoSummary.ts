import { GeneratedSummaryModel } from "./schema";
/**
 *
 * @param userId
 * @returns summaries
 */
export const getAllVideoSummary = async (userId: string) => {
  const summaries = await GeneratedSummaryModel.find({ userId });
  return summaries;
};
