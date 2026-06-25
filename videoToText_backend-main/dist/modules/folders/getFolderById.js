"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFolderById = void 0;
const schema_1 = require("./schema");
/**
 *
 * @param id
 * @param userId
 * @returns folder
 */
const getFolderById = async (id, userId) => {
    try {
        const folder = await schema_1.FolderModel.findOne({ _id: id, userId });
        return folder;
    }
    catch (error) {
        console.log(error, "error while getFolderById");
        throw new Error(`error occur: ${error.message}`);
    }
};
exports.getFolderById = getFolderById;
//# sourceMappingURL=getFolderById.js.map