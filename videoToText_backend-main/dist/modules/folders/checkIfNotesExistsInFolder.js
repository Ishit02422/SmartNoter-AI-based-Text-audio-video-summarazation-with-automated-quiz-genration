"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkIfNotesExistsInFolder = void 0;
const schema_1 = require("../generatedSummaryFromAudio/schema");
const schema_2 = require("../generatedSummaryFromPdf/schema");
const schema_3 = require("../generateSummaryFromYoutube/schema");
const getFolderById_1 = require("./getFolderById");
const generatedSummaryFromWeb_1 = require("../generatedSummaryFromWeb");
const generateSummaryFromText_1 = require("../generateSummaryFromText");
/**
 *
 * @param folderId
 * @param userId
 */
const checkIfNotesExistsInFolder = async (folderId, userId) => {
    try {
        const folder = await (0, getFolderById_1.getFolderById)(folderId, userId);
        let params = {
            userId: userId.toString(),
        };
        if (folder.folderName !== "All Notes") {
            params.folderId = folderId;
        }
        const audioNotes = await schema_1.GeneratedSummaryAudioModel.find(params);
        const pdfNotes = await schema_2.GenerateSummyPdfModel.find(params);
        const videoNotes = await schema_3.GeneratedSummaryModel.find(params);
        const webNotes = await generatedSummaryFromWeb_1.GeneratedSummaryWebModel.find(params);
        const textNotes = await generateSummaryFromText_1.GeneratedSummaryTextModel.find(params);
        const res = {};
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
    }
    catch (error) {
        console.log(error, "error when delete folder");
        throw new Error(`Error when delete folder :${error.message}`);
    }
};
exports.checkIfNotesExistsInFolder = checkIfNotesExistsInFolder;
//# sourceMappingURL=checkIfNotesExistsInFolder.js.map