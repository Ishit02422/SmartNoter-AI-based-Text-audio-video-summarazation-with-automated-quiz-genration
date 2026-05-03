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
  userId?: Types.ObjectId | string;
  source?: string;
  createdAt?:
    | Date
    | {
        $gte: Date;
        $lte: Date;
      };
};
/**
 *
 * @param params
 */

export const getAllSummaries = async (params: param) => {
  try {
    let { createdAt, source, userId } = params;
    const finalParam = { createdAt, userId };
    let audioNotes;
    let pdfNotes;
    let videoNotes;
    let webNotes;
    let textNotes;
    switch (params.source) {
      case "pdf":
        pdfNotes = await GenerateSummyPdfModel.find(finalParam);

        break;
      case "text":
        textNotes = await GeneratedSummaryTextModel.find(finalParam);
        break;

      case "web":
        webNotes = await GeneratedSummaryWebModel.find(finalParam);
        break;
      case "audio":
        audioNotes = await GeneratedSummaryAudioModel.find(finalParam);
        break;

      case "video":
        videoNotes = await GeneratedSummaryModel.find(finalParam);
        break;

      default:
        pdfNotes = await GenerateSummyPdfModel.find(finalParam);
        textNotes = await GeneratedSummaryTextModel.find(finalParam);
        webNotes = await GeneratedSummaryWebModel.find(finalParam);
        audioNotes = await GeneratedSummaryAudioModel.find(finalParam);
        videoNotes = await GeneratedSummaryModel.find(finalParam);
        break;
    }

    let res: resType = {};
    if (audioNotes && audioNotes?.length > 0) {
      res.audio = audioNotes;
    }
    if (pdfNotes && pdfNotes?.length > 0) {
      res.pdf = pdfNotes;
    }
    if (videoNotes && videoNotes?.length > 0) {
      res.video = videoNotes;
    }
    if (webNotes && webNotes?.length > 0) {
      res.web = webNotes;
    }
    if (textNotes && textNotes?.length > 0) {
      res.text = textNotes;
    }

    return {
      summaries: res,
      audioSummaries: audioNotes?.length,
      videoSummaries: videoNotes?.length,
      pdfSummaries: pdfNotes?.length,
      webSummaries: webNotes?.length,
      textSummaries: textNotes?.length,
      totalSummaries:
        audioNotes?.length +
        videoNotes?.length +
        pdfNotes?.length +
        webNotes?.length +
        textNotes?.length,
    };
  } catch (error) {
    console.log(error, "error when get all summaries");
    throw new Error(`Error when get all summaries :${error.message}`);
  }
};
