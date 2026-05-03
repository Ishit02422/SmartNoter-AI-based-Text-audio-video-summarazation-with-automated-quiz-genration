import { GeneratedSummaryAudioModel } from "../generatedSummaryFromAudio/schema";
import { GenerateSummyPdfModel } from "../generatedSummaryFromPdf/schema";
import { GeneratedSummaryWebModel } from "../generatedSummaryFromWeb";
import { GeneratedSummaryModel } from "../generateSummaryFromYoutube/schema";
import { FolderModel } from "./schema";

/**
 *
 * @param folderId
 */
export const deleteFolder = async (folderId: string) => {
  try {
    await GeneratedSummaryAudioModel.updateMany(
      { folderId },
      { $set: { folderId: null } }
    );
    await GenerateSummyPdfModel.updateMany(
      { folderId },
      { $set: { folderId: null } }
    );
    await GeneratedSummaryModel.updateMany(
      { folderId },
      { $set: { folderId: null } }
    );
    await GeneratedSummaryWebModel.updateMany(
      { folderId },
      { $set: { folderId: null } }
    );

    await FolderModel.findByIdAndDelete(folderId);
  } catch (error) {
    console.log(error, "error when delete folder");
    throw new Error(`Error when delete folder :${error.message}`);
  }
};
