"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSummaryFromSouceAndSummaryId = void 0;
const generatedSummaryFromPdf_1 = require("../generatedSummaryFromPdf");
const generatedSummaryFromAudio_1 = require("../generatedSummaryFromAudio");
const generateSummaryFromYoutube_1 = require("../generateSummaryFromYoutube");
const generatedSummaryFromWeb_1 = require("../generatedSummaryFromWeb");
const generateSummaryFromText_1 = require("../generateSummaryFromText");
/**
 *
 * @param source
 * @param summaryId
 * @param userId
 * @returns summary
 */
const getSummaryFromSouceAndSummaryId = async (source, summaryId, userId) => {
    let summary;
    switch (source) {
        case "pdf":
            const isPdfSummary = await (0, generatedSummaryFromPdf_1.checkPdfSummaryIsExistById)(summaryId, userId);
            if (!isPdfSummary) {
                throw new Error("PDF Summary is not exists.");
            }
            summary = isPdfSummary;
            break;
        case "audio":
            const isAudioSummary = await (0, generatedSummaryFromAudio_1.checkAudioSummaryIsExistById)(summaryId, userId);
            if (!isAudioSummary) {
                throw new Error("Audio Summary is not exists.");
            }
            summary = isAudioSummary;
            break;
        case "video":
            const isVideoSummary = await (0, generateSummaryFromYoutube_1.checkVideoSummaryIsExistById)(summaryId, userId);
            if (!isVideoSummary) {
                throw new Error("Video Summary is not exists.");
            }
            summary = isVideoSummary;
            break;
        case "web":
            const isWebSummary = await (0, generatedSummaryFromWeb_1.checkWebSummaryIsExistById)(summaryId, userId);
            if (!isWebSummary) {
                throw new Error("Web Summary is not exists.");
            }
            summary = isWebSummary;
            break;
        case "text":
            const textSummary = await (0, generateSummaryFromText_1.checkTextSummaryIsExistById)(summaryId, userId);
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
exports.getSummaryFromSouceAndSummaryId = getSummaryFromSouceAndSummaryId;
//# sourceMappingURL=getSummaryFromSource.js.map