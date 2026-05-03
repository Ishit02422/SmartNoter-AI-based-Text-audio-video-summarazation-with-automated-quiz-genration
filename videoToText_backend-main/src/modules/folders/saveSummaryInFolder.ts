import { GeneratedSummaryAudioModel } from "../generatedSummaryFromAudio/schema";
import { GenerateSummyPdfModel } from "../generatedSummaryFromPdf/schema";
import { GeneratedSummaryWebModel } from "../generatedSummaryFromWeb";
import { GeneratedSummaryTextModel } from "../generateSummaryFromText";
import { GeneratedSummaryModel } from "../generateSummaryFromYoutube/schema";

/**
 *
 * @param source
 * @param folderId
 * @param summaryId
 * @returns summary
 */
export const saveSummaryInFolder = async (
  source: string,
  folderId: string,
  summaryId: string
) => {
  try {
    let savedData;

    switch (source) {
      case "pdf":
        savedData = await GenerateSummyPdfModel.findByIdAndUpdate(
          summaryId,
          {
            $set: { folderId },
          },
          { new: true }
        );
        break;
      case "audio":
        savedData = await GeneratedSummaryAudioModel.findByIdAndUpdate(
          summaryId,
          {
            $set: { folderId },
          },
          { new: true }
        );
        break;
      case "video":
        savedData = await GeneratedSummaryModel.findByIdAndUpdate(
          summaryId,
          {
            $set: { folderId },
          },
          { new: true }
        );
        break;
      case "web":
        savedData = await GeneratedSummaryWebModel.findByIdAndUpdate(
          summaryId,
          { $set: { folderId } },
          { new: true }
        );
        break;
      case "text":
        savedData = await GeneratedSummaryTextModel.findByIdAndUpdate(
          summaryId,
          { $set: { folderId } },
          { new: true }
        );
        break;
      default:
        throw new Error("Invalid Source Type");
    }
    if (!savedData) {
      throw new Error("Invalid Summary Id");
    }
    return savedData;
  } catch (error) {
    console.log(error);
    throw new Error(`Error occur : ${error.message}`);
  }
};
