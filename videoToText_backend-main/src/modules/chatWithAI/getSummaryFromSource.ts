import { Types } from "mongoose";
import { checkPdfSummaryIsExistById } from "../generatedSummaryFromPdf";
import { checkAudioSummaryIsExistById } from "../generatedSummaryFromAudio";
import { checkVideoSummaryIsExistById } from "../generateSummaryFromYoutube";
import { checkWebSummaryIsExistById } from "../generatedSummaryFromWeb";
import { checkTextSummaryIsExistById } from "../generateSummaryFromText";
/**
 *
 * @param source
 * @param summaryId
 * @param userId
 * @returns summary
 */
export const getSummaryFromSouceAndSummaryId = async (
  source: string,
  summaryId: string,
  userId: string | Types.ObjectId
) => {
  let summary;
  switch (source) {
    case "pdf":
      const isPdfSummary = await checkPdfSummaryIsExistById(summaryId, userId);
      if (!isPdfSummary) {
        throw new Error("PDF Summary is not exists.");
      }
      summary = isPdfSummary;
      break;
    case "audio":
      const isAudioSummary = await checkAudioSummaryIsExistById(
        summaryId,
        userId
      );
      if (!isAudioSummary) {
        throw new Error("Audio Summary is not exists.");
      }
      summary = isAudioSummary;
      break;
    case "video":
      const isVideoSummary = await checkVideoSummaryIsExistById(
        summaryId,
        userId
      );
      if (!isVideoSummary) {
        throw new Error("Video Summary is not exists.");
      }
      summary = isVideoSummary;
      break;
    case "web":
      const isWebSummary = await checkWebSummaryIsExistById(summaryId, userId);
      if (!isWebSummary) {
        throw new Error("Web Summary is not exists.");
      }
      summary = isWebSummary;
      break;
    case "text":
      const textSummary = await checkTextSummaryIsExistById(summaryId, userId);
      if (!textSummary) {
        throw new Error("Text Summary is not exists.");
      }
      summary = textSummary;
      break;
    default:
      throw new Error("Invalid Source");
      break;
  }
  return summary;
};
