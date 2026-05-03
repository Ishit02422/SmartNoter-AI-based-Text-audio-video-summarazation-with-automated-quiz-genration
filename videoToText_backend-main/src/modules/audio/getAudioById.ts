import { Audio } from ".";
import { AudioModel } from "./schema";

/**
 *
 * @param _id
 * @returns relevant audio
 */
export const getAudioById = async (_id: string) => {
  const audio = await AudioModel.findById(_id);
  return audio ? new Audio(audio) : null;
};
