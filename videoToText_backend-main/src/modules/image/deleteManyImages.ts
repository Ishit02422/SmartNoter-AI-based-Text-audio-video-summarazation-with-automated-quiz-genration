import { Image } from ".";
import { ImageModel } from "./schema";

/**
 *
 * @param image image class
 */
export const deleteManyImages = async (createdAt) => {
  await ImageModel.deleteMany(createdAt);
};
