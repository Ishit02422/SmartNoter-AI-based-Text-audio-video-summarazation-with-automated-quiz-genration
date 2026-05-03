import { GeneratedSummaryAudio } from ".";
import { GeneratedSummaryAudioModel } from "./schema";

/**
 * function for save generatedSummary in database
 * @param generatedSummary
 * @returns generatedSummary itself
 */
export const saveGeneratedSummary = async (
  generatedSummary: GeneratedSummaryAudio
) => {
  //   const savedGeneratedSummary = await new GeneratedSummaryAudioModel(
  //     generatedSummary.toJSON()
  //   ).save();

  const savedGeneratedSummary = await GeneratedSummaryAudioModel.create(
    generatedSummary
  );
  return savedGeneratedSummary;
};
