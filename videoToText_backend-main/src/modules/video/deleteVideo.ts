import { Audio } from "../audio";
import { AudioModel } from "../audio/schema";


/**
 *
 * @param audio audio class
 */
export const deleteAudio = async (audio: Audio) => {
  await AudioModel.findByIdAndDelete(audio._id.toString());
};
