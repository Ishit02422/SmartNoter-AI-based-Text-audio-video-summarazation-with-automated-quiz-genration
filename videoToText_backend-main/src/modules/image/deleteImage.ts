import { Image } from ".";
import { ImageModel } from "./schema";

/**
 *
 * @param image image class
 */
export const deleteImage = async (imageId: string) => {
  await ImageModel.findByIdAndDelete(imageId);
};
