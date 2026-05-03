import { Types } from "mongoose";
import { FolderModel } from "./schema";
/**
 *
 * @param userId
 * @param folderName
 * @returns folder
 */
export const checkFolderExistsWithUserId = async (
  userId?: string | Types.ObjectId,
  folderName?: string,
  folderId?: string
) => {
  let params: any = { userId };
  if (folderName) {
    params.folderName = folderName;
  }
  if (folderId) {
    params._id = folderId;
  }
  console.log(params);

  const isExist = await FolderModel.findOne(params);
  return isExist;
};
