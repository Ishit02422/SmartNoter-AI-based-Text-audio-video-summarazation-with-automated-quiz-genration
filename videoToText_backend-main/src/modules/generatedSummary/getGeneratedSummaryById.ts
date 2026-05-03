import { GeneratedSummary } from "./types";
import { GeneratedSummaryModel } from "./schema";

/**
 *
 * @param name generatedSummary name
 * @returns relevant category record | null
 */
export const getGeneratedSummaryById = async (_id: string) => {
  const generatedSummary = await GeneratedSummaryModel.findOne({ _id }).lean();
  return generatedSummary ? generatedSummary : null;
};
