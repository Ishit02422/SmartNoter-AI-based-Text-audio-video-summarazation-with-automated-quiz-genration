"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkFolderExistsWithUserId = void 0;
const schema_1 = require("./schema");
/**
 *
 * @param userId
 * @param folderName
 * @returns folder
 */
const checkFolderExistsWithUserId = async (userId, folderName, folderId) => {
    let params = { userId };
    if (folderName) {
        params.folderName = folderName;
    }
    if (folderId) {
        params._id = folderId;
    }
    console.log(params);
    const isExist = await schema_1.FolderModel.findOne(params);
    return isExist;
};
exports.checkFolderExistsWithUserId = checkFolderExistsWithUserId;
//# sourceMappingURL=checkIfExistFolderWithUserId.js.map