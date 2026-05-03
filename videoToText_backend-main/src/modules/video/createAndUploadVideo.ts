import { Types } from "mongoose";
import { saveVideo, Video } from ".";
import { Upload } from "@aws-sdk/lib-storage";
import { S3 } from "@aws-sdk/client-s3";
interface UploadFileProps {
  filename: string;
  mimetype: string;
  encoding: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createReadStream: any;
}

/**
 *
 * @param file UploadFileProps
 * @param title
 * @returns Video
 */
export const createAndUploadVideo = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  file: UploadFileProps | any,
  title: string,
  userId: string | Types.ObjectId
): Promise<Video> => {
  const s3 = new S3({
    endpoint: process.env.S3_END_POINT,
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
    },
  });
  const _id = new Types.ObjectId().toString();

  const uploadedVideo = await new Upload({
    client: s3,

    params: {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `video/${Date.now() + "_" + _id + "_" + file.originalname}`,
      Body: file.buffer,
      ACL: "public-read",
    },
  }).done();
  //@ts-ignore
  const S3AudioURL = uploadedVideo.Key;
  const video = new Video({
    _id,
    title: title,
    videoURL: S3AudioURL,
    userId,
  });
  return await saveVideo(video);
};
