import { Image } from "./types";
import { ImageModel } from "./schema";

/**
 *
 * @param name image name
 * @returns relevant category record | null
 */
export const getAllImage = async () => {
  const image = await ImageModel.find();
  return image ? image.map((item) => new Image(item)) : null;
};
