"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editFolder = void 0;
const schema_1 = require("./schema");
/**
 *
 * @param folderId
 * @returns folder
 */
const editFolder = async (folderId, data) => {
    try {
        const savedFolder = await schema_1.FolderModel.findByIdAndUpdate(folderId, {
            $set: data,
        }, { new: true });
        return savedFolder;
    }
    catch (error) {
        console.log(error);
        throw new Error(`Error occur : ${error.message}`);
    }
};
exports.editFolder = editFolder;
//# sourceMappingURL=editFolder.js.map