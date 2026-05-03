import { IVideo, Video } from ".";
import { VideoModel } from "./schema";

/**
 * function for save audio in database
 * @param video
 * @returns video itself
 */
export const saveVideo = async (video: Video) => {
  await new VideoModel(video.toJSON()).save();
  return video;
};
