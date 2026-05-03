import { GeneratedSummaryTextModel } from "./schema";
/**
 *
 * @param userId
 * @returns summaries
 */
export const getAllTextSummary = async (userId: string) => {
  const summaries = await GeneratedSummaryTextModel.find({ userId });
  return summaries;
};
