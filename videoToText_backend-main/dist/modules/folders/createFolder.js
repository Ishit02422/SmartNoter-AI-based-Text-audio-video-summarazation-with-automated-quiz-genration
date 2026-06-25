"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFolder = void 0;
const schema_1 = require("./schema");
/**
 *
 * @param userId
 * @param folderData
 * @returns folder
 */
const createFolder = async (userId, folderData) => {
    try {
        const folder = await schema_1.FolderModel.create({
            ...folderData,
            userId,
        });
        return folder;
    }
    catch (error) {
        throw new Error(`Error when create folder, ${error.message}`);
    }
};
exports.createFolder = createFolder;
//# sourceMappingURL=createFolder.js.map