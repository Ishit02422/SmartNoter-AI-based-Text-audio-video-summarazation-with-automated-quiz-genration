"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveSummaryInFolder = void 0;
const schema_1 = require("../generatedSummaryFromAudio/schema");
const schema_2 = require("../generatedSummaryFromPdf/schema");
const generatedSummaryFromWeb_1 = require("../generatedSummaryFromWeb");
const generateSummaryFromText_1 = require("../generateSummaryFromText");
const schema_3 = require("../generateSummaryFromYoutube/schema");
/**
 *
 * @param source
 * @param folderId
 * @param summaryId
 * @returns summary
 */
const saveSummaryInFolder = async (source, folderId, summaryId) => {
    try {
        let savedData;
        switch (source) {
            case "pdf":
                savedData = await schema_2.GenerateSummyPdfModel.findByIdAndUpdate(summaryId, {
                    $set: { folderId },
                }, { new: true });
                break;
            case "audio":
                savedData = await schema_1.GeneratedSummaryAudioModel.findByIdAndUpdate(summaryId, {
                    $set: { folderId },
                }, { new: true });
                break;
            case "video":
                savedData = await schema_3.GeneratedSummaryModel.findByIdAndUpdate(summaryId, {
                    $set: { folderId },
                }, { new: true });
                break;
            case "web":
                savedData = await generatedSummaryFromWeb_1.GeneratedSummaryWebModel.findByIdAndUpdate(summaryId, { $set: { folderId } }, { new: true });
                break;
            case "text":
                savedData = await generateSummaryFromText_1.GeneratedSummaryTextModel.findByIdAndUpdate(summaryId, { $set: { folderId } }, { new: true });
                break;
            default:
                throw new Error("Invalid Source Type");
        }
        if (!savedData) {
            throw new Error("Invalid Summary Id");
        }
        return savedData;
    }
    catch (error) {
        console.log(error);
        throw new Error(`Error occur : ${error.message}`);
    }
};
exports.saveSummaryInFolder = saveSummaryInFolder;
//# sourceMappingURL=saveSummaryInFolder.js.map