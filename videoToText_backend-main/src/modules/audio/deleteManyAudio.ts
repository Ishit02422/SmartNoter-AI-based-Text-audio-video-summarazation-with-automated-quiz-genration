import { Audio } from ".";
import { AudioModel } from "./schema";

/**
 *
 * @param audio class
 */
export const deleteManyAudios = async (createdAt) => {
  await AudioModel.deleteMany(createdAt);
};
