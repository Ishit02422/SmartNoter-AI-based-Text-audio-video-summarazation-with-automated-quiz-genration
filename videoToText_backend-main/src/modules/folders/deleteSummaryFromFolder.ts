import { GeneratedSummaryAudioModel } from "../generatedSummaryFromAudio/schema";
import { GenerateSummyPdfModel } from "../generatedSummaryFromPdf/schema";
import { GeneratedSummaryWebModel } from "../generatedSummaryFromWeb";
import { GeneratedSummaryTextModel } from "../generateSummaryFromText";
import { GeneratedSummaryModel } from "../generateSummaryFromYoutube/schema";

export const deleteSummaryFromFolder = async (
  source: string,
  summaryId: string
) => {
  try {
    switch (source) {
      case "pdf":
        await GenerateSummyPdfModel.findByIdAndUpdate(summaryId, {
          $set: { folderId: null },
        });

        break;
      case "audio":
        await GeneratedSummaryAudioModel.findByIdAndUpdate(summaryId, {
          $set: { folderId: null },
        });
        break;
      case "video":
        await GeneratedSummaryModel.findByIdAndUpdate(summaryId, {
          $set: { folderId: null },
        });
        break;
      case "web":
        await GeneratedSummaryWebModel.findByIdAndUpdate(summaryId, {
          $set: { folderId: null },
        });
        break;
      case "text":
        await GeneratedSummaryTextModel.findByIdAndUpdate(summaryId, {
          $set: { folderId: null },
        });
        break;
      default:
        throw new Error("Invalid source type");
    }
  } catch (error) {
    throw new Error(`Error occur : ${error.message}`);
  }
};
