import { Audio } from ".";
import { AudioModel } from "./schema";

/**
 * function for save audio in database
 * @param audio
 * @returns audio itself
 */
export const saveAudio = async (audio: Audio) => {
  await new AudioModel(audio.toJSON()).save();
  return audio;
};
