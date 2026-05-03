import { Audio } from "./types";
import { AudioModel } from "./schema";

/**
 *
 * @param name audio name
 * @returns relevant category record | null
 */
export const getAllAudio = async (createdAt) => {
  const audio = await AudioModel.find(createdAt);
  return audio ? audio.map((item) => new Audio(item)) : null;
};
