import { GeneratedSummaryWebModel } from "./schema";
/**
 *
 * @param userId
 * @returns summaries
 */
export const getAllWebSummary = async (userId: string) => {
  const summaries = await GeneratedSummaryWebModel.find({ userId });
  return summaries;
};
