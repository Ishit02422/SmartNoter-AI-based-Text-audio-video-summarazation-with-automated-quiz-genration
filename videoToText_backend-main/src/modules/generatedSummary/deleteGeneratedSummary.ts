import { GeneratedSummary } from ".";
import { GeneratedSummaryModel } from "./schema";

/**
 *
 * @param generatedSummary generatedSummary class
 */
export const deleteGeneratedSummary = async (
  generatedSummary: GeneratedSummary
) => {
  await GeneratedSummaryModel.findByIdAndDelete(
    generatedSummary._id.toString()
  );
};
