import mongoose from "mongoose";
import { FolderModel } from "./schema";
import { IFolders } from "./types";
import { Types } from "mongoose";
type folderType = {
  defaultFolder: IFolders[];
  otherFolders: IFolders[];
};
/**
 *
 * @param userId
 * @returns folders
 */
export const getAllFolders = async (userId?: string | Types.ObjectId) => {
  const folders = await FolderModel.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId), // Convert to ObjectId
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
