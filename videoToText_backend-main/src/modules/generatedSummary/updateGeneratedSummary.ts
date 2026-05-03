import { GeneratedSummary } from "./types";
import { GeneratedSummaryModel } from "./schema";

export const updateGeneratedSummary = async (
  generatedSummary: GeneratedSummary
) => {

  await GeneratedSummaryModel.findByIdAndUpdate(
    generatedSummary._id,
    generatedSummary.toJSON()
  );
  return generatedSummary;
};
