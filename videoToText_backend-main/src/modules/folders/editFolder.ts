import { FolderModel } from "./schema";
import { IFolders } from "./types";

/**
 *
 * @param folderId
 * @returns folder
 */
export const editFolder = async (folderId: string, data: IFolders) => {
  try {
    const savedFolder = await FolderModel.findByIdAndUpdate(
      folderId,
      {
        $set: data,
      },
      { new: true }
    );
    return savedFolder;
  } catch (error) {
    console.log(error);
    throw new Error(`Error occur : ${error.message}`);
  }
};
