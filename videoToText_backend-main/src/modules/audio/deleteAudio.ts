import { Audio } from ".";
import { AudioModel } from "./schema";

/**
 *
 * @param audio audio class
 */
export const deleteAudio = async (audio: Audio) => {
  await AudioModel.findByIdAndDelete(audio._id.toString());
};
