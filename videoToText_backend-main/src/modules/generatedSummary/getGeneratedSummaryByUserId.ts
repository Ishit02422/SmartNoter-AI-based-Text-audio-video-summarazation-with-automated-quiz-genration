import { GeneratedSummary } from "./types";
import { GeneratedSummaryModel } from "./schema";

/**
 *
 * @param name generatedSummary name
 * @returns relevant category record | null
 */
export const getGeneratedSummaryByUserId = async (
  userId: string,
  page: number,
  limit: number
) => {
  const generatedSummary = await GeneratedSummaryModel.find({ userId })
    .lean()
    .populate({ path: "imageId" })
    .skip((page - 1) * limit)
    .limit(limit);
  return generatedSummary
    ? generatedSummary.map((item) => new GeneratedSummary(item))
    : null;
};
