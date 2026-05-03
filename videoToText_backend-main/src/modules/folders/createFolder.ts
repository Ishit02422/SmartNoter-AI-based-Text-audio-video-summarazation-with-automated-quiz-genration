import { Types } from "mongoose";
import { FolderModel } from "./schema";
import { IFolders } from "./types";
/**
 *
 * @param userId
 * @param folderData
 * @returns folder
 */

export const createFolder = async (
  userId?: string | Types.ObjectId,
  folderData?: any
) => {
  try {
    const folder: IFolders = await FolderModel.create({
      ...folderData,
      userId,
    });
    return folder;
  } catch (error) {
    throw new Error(`Error when create folder, ${error.message}`);
  }
};
