import { Types } from "mongoose";
import { Image } from ".";
import { saveImage } from "./saveImage";
import { Upload } from "@aws-sdk/lib-storage";
import { S3 } from "@aws-sdk/client-s3";
import sharp from "sharp";
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
 * @param description
 * @returns Image
 */
export const createAndUploadThumbnail = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  file: UploadFileProps | any,
  title: string,
  description: string,
  userId: string
): Promise<Image> => {
  const s3 = new S3({
    endpoint: process.env.S3_END_POINT,
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
    },
  });
  const _id = new Types.ObjectId().toString();
  const thumbnailBuffer = await sharp(file.buffer)
    .toFormat("png")
    .jpeg({ quality: 40 })
    .toBuffer();

  const thumbnailImg = await new Upload({
    client: s3,

    params: {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `images2/${Date.now()}_${_id}_thumbnail.png`,
      Body: thumbnailBuffer,
      ACL: "public-read",
    },
  }).done();
  //@ts-ignore
  const thumbnail = (thumbnailImg as any).Location || (process.env.BASE_URL?.trim()?.replace(/\/$/, "") + "/" + thumbnailImg.Key);
  const image = new Image({
    _id,
    title: title,
    thumbnail: thumbnail,
    description,
    userId,
  });
  return await saveImage(image);
};
