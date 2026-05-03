import { Types } from "mongoose";
import { FolderModel } from "./schema";
import { IFolders } from "./types";
/**
 *
 * @param id
 * @param userId
 * @returns folder
 */
export const getFolderById = async (
  id: string,
  userId?: string | Types.ObjectId
) => {
  try {
    const folder: IFolders = await FolderModel.findOne({ _id: id, userId });
    return folder;
  } catch (error) {
    console.log(error, "error while getFolderById");
    throw new Error(`error occur: ${error.message}`);
  }
};
