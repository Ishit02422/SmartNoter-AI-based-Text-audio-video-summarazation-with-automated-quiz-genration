"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFolder = void 0;
const schema_1 = require("../generatedSummaryFromAudio/schema");
const schema_2 = require("../generatedSummaryFromPdf/schema");
const generatedSummaryFromWeb_1 = require("../generatedSummaryFromWeb");
const schema_3 = require("../generateSummaryFromYoutube/schema");
const schema_4 = require("./schema");
/**
 *
 * @param folderId
 */
const deleteFolder = async (folderId) => {
    try {
        await schema_1.GeneratedSummaryAudioModel.updateMany({ folderId }, { $set: { folderId: null } });
        await schema_2.GenerateSummyPdfModel.updateMany({ folderId }, { $set: { folderId: null } });
        await schema_3.GeneratedSummaryModel.updateMany({ folderId }, { $set: { folderId: null } });
        await generatedSummaryFromWeb_1.GeneratedSummaryWebModel.updateMany({ folderId }, { $set: { folderId: null } });
        await schema_4.FolderModel.findByIdAndDelete(folderId);
    }
    catch (error) {
        console.log(error, "error when delete folder");
        throw new Error(`Error when delete folder :${error.message}`);
    }
};
exports.deleteFolder = deleteFolder;
//# sourceMappingURL=deleteFolder.js.map