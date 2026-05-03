import { Types } from "mongoose";
import { IGeneratedSummaryAudio } from "../generatedSummaryFromAudio";
import { GeneratedSummaryAudioModel } from "../generatedSummaryFromAudio/schema";
import { IGenerateSummaryPdf } from "../generatedSummaryFromPdf";
import { GenerateSummyPdfModel } from "../generatedSummaryFromPdf/schema";
import { IGeneratedSummaryVideo } from "../generateSummaryFromYoutube";
import { GeneratedSummaryModel } from "../generateSummaryFromYoutube/schema";
import { getFolderById } from "./getFolderById";
import { FolderModel } from "./schema";
import {
  GeneratedSummaryWebModel,
  IGeneratedSummaryFromWeb,
} from "../generatedSummaryFromWeb";
import {
  GeneratedSummaryTextModel,
  IGenerateSummaryText,
} from "../generateSummaryFromText";
type resType = {
  audio?: IGeneratedSummaryAudio[];
  pdf?: IGenerateSummaryPdf[];
  video?: IGeneratedSummaryVideo[];
  web?: IGeneratedSummaryFromWeb[];
  text?: IGenerateSummaryText[];
};
type param = {
  userId?: string;
  folderId?: string;
};
/**
 *
 * @param folderId
 * @param userId
 */
export const checkIfNotesExistsInFolder = async (
  folderId: string,
  userId: string | Types.ObjectId
) => {
  try {
    const folder = await getFolderById(folderId, userId);
    let params: param = {
      userId: userId.toString(),
    };

    if (folder.folderName !== "All Notes") {
      params.folderId = folderId;
    }

    const audioNotes = await GeneratedSummaryAudioModel.find(params);
    const pdfNotes = await GenerateSummyPdfModel.find(params);
    const videoNotes = await GeneratedSummaryModel.find(params);
    const webNotes = await GeneratedSummaryWebModel.find(params);
    const textNotes = await GeneratedSummaryTextModel.find(params);
    const res: resType = {};
    if (audioNotes.length > 0) {
      res.audio = audioNotes;
    }
    if (pdfNotes.length > 0) {
      res.pdf = pdfNotes;
    }
    if (videoNotes.length > 0) {
      res.video = videoNotes;
    }
    if (webNotes.length > 0) {
      res.web = webNotes;
    }
    if (textNotes.length > 0) {
      res.text = textNotes;
    }

    return {
      res,
      audioFiles: audioNotes.length,
      videoFiles: videoNotes.length,
      pdfNotes: pdfNotes.length,
      webNotes: webNotes.length,
      textNotes: textNotes.length,
    };
  } catch (error) {
    console.log(error, "error when delete folder");
    throw new Error(`Error when delete folder :${error.message}`);
  }
};
