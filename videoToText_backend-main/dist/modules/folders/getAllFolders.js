"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllFolders = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const schema_1 = require("./schema");
/**
 *
 * @param userId
 * @returns folders
 */
const getAllFolders = async (userId) => {
    const folders = await schema_1.FolderModel.aggregate([
        {
            $match: {
                userId: new mongoose_1.default.Types.ObjectId(userId), // Convert to ObjectId
            },
        },
        {
            $facet: {
                defaultFolder: [{ $match: { folderName: "All Notes" } }, { $limit: 1 }],
                otherFolders: [{ $match: { folderName: { $ne: "All Notes" } } }],
            },
        },
    ]);
    // const folders: IFolders[] = await FolderModel.find({ userId });
    return folders[0];
};
exports.getAllFolders = getAllFolders;
//# sourceMappingURL=getAllFolders.js.map