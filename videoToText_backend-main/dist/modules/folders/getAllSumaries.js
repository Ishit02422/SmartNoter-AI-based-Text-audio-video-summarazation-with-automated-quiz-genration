"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllSummaries = void 0;
const schema_1 = require("../generatedSummaryFromAudio/schema");
const schema_2 = require("../generatedSummaryFromPdf/schema");
const schema_3 = require("../generateSummaryFromYoutube/schema");
const generatedSummaryFromWeb_1 = require("../generatedSummaryFromWeb");
const generateSummaryFromText_1 = require("../generateSummaryFromText");
/**
 *
 * @param params
 */
const getAllSummaries = async (params) => {
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
                pdfNotes = await schema_2.GenerateSummyPdfModel.find(finalParam);
                break;
            case "text":
                textNotes = await generateSummaryFromText_1.GeneratedSummaryTextModel.find(finalParam);
                break;
            case "web":
                webNotes = await generatedSummaryFromWeb_1.GeneratedSummaryWebModel.find(finalParam);
                break;
            case "audio":
                audioNotes = await schema_1.GeneratedSummaryAudioModel.find(finalParam);
                break;
            case "video":
                videoNotes = await schema_3.GeneratedSummaryModel.find(finalParam);
                break;
            default:
                pdfNotes = await schema_2.GenerateSummyPdfModel.find(finalParam);
                textNotes = await generateSummaryFromText_1.GeneratedSummaryTextModel.find(finalParam);
                webNotes = await generatedSummaryFromWeb_1.GeneratedSummaryWebModel.find(finalParam);
                audioNotes = await schema_1.GeneratedSummaryAudioModel.find(finalParam);
                videoNotes = await schema_3.GeneratedSummaryModel.find(finalParam);
                break;
        }
        let res = {};
        if (audioNotes && (audioNotes === null || audioNotes === void 0 ? void 0 : audioNotes.length) > 0) {
            res.audio = audioNotes;
        }
        if (pdfNotes && (pdfNotes === null || pdfNotes === void 0 ? void 0 : pdfNotes.length) > 0) {
            res.pdf = pdfNotes;
        }
        if (videoNotes && (videoNotes === null || videoNotes === void 0 ? void 0 : videoNotes.length) > 0) {
            res.video = videoNotes;
        }
        if (webNotes && (webNotes === null || webNotes === void 0 ? void 0 : webNotes.length) > 0) {
            res.web = webNotes;
        }
        if (textNotes && (textNotes === null || textNotes === void 0 ? void 0 : textNotes.length) > 0) {
            res.text = textNotes;
        }
        return {
            summaries: res,
            audioSummaries: audioNotes === null || audioNotes === void 0 ? void 0 : audioNotes.length,
            videoSummaries: videoNotes === null || videoNotes === void 0 ? void 0 : videoNotes.length,
            pdfSummaries: pdfNotes === null || pdfNotes === void 0 ? void 0 : pdfNotes.length,
            webSummaries: webNotes === null || webNotes === void 0 ? void 0 : webNotes.length,
            textSummaries: textNotes === null || textNotes === void 0 ? void 0 : textNotes.length,
            totalSummaries: (audioNotes === null || audioNotes === void 0 ? void 0 : audioNotes.length) +
                (videoNotes === null || videoNotes === void 0 ? void 0 : videoNotes.length) +
                (pdfNotes === null || pdfNotes === void 0 ? void 0 : pdfNotes.length) +
                (webNotes === null || webNotes === void 0 ? void 0 : webNotes.length) +
                (textNotes === null || textNotes === void 0 ? void 0 : textNotes.length),
        };
    }
    catch (error) {
        console.log(error, "error when get all summaries");
        throw new Error(`Error when get all summaries :${error.message}`);
    }
};
exports.getAllSummaries = getAllSummaries;
//# sourceMappingURL=getAllSumaries.js.map