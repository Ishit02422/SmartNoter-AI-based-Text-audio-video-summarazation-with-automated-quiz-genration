import { AudioModel } from "../audio/schema";


/**
 *
 * @param audio class
 */
export const deleteManyAudios = async (createdAt) => {
  await AudioModel.deleteMany(createdAt);
};
