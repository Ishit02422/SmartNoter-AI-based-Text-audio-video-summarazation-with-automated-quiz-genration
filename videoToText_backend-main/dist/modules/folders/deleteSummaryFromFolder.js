"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSummaryFromFolder = void 0;
const schema_1 = require("../generatedSummaryFromAudio/schema");
const schema_2 = require("../generatedSummaryFromPdf/schema");
const generatedSummaryFromWeb_1 = require("../generatedSummaryFromWeb");
const generateSummaryFromText_1 = require("../generateSummaryFromText");
const schema_3 = require("../generateSummaryFromYoutube/schema");
const deleteSummaryFromFolder = async (source, summaryId) => {
    try {
        switch (source) {
            case "pdf":
                await schema_2.GenerateSummyPdfModel.findByIdAndUpdate(summaryId, {
                    $set: { folderId: null },
                });
                break;
            case "audio":
                await schema_1.GeneratedSummaryAudioModel.findByIdAndUpdate(summaryId, {
                    $set: { folderId: null },
                });
                break;
            case "video":
                await schema_3.GeneratedSummaryModel.findByIdAndUpdate(summaryId, {
                    $set: { folderId: null },
                });
                break;
            case "web":
                await generatedSummaryFromWeb_1.GeneratedSummaryWebModel.findByIdAndUpdate(summaryId, {
                    $set: { folderId: null },
                });
                break;
            case "text":
                await generateSummaryFromText_1.GeneratedSummaryTextModel.findByIdAndUpdate(summaryId, {
                    $set: { folderId: null },
                });
                break;
            default:
                throw new Error("Invalid source type");
        }
    }
    catch (error) {
        throw new Error(`Error occur : ${error.message}`);
    }
};
exports.deleteSummaryFromFolder = deleteSummaryFromFolder;
//# sourceMappingURL=deleteSummaryFromFolder.js.map