import { GeneratedSummary } from ".";
import { GeneratedSummaryModel } from "./schema";

/**
 *
 * @param generatedSummary class
 */
export const deleteManyGeneratedSummarys = async (createdAt) => {
  await GeneratedSummaryModel.deleteMany(createdAt);
};
