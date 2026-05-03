import { Video } from ".";
import { VideoModel } from "./schema";

/**
 *
 * @param _id
 * @returns relevant video
 */
export const getVideoById = async (_id: string) => {
  const video = await VideoModel.findById(_id);
  return video ? new Video(video) : null;
};
