import { S3 } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { Types } from "mongoose";
import sharp from "sharp";
import { Image } from ".";
import { saveImage } from "./saveImage";
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
export const createAndUploadImageAndThumbnail = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  file: UploadFileProps | any,
  title: string,
  description: string,
  userId: string | Types.ObjectId
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
  const uploadedImage = await new Upload({
    client: s3,

    params: {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `images2/${Date.now() + "_" + _id + "_" + file.originalname}`,
      Body: file.buffer,
      ACL: "public-read",
    },
  }).done();
  //@ts-ignore
  //@ts-ignore
  let S3ImageURL = (uploadedImage as any).Location || uploadedImage.Key;
  if (S3ImageURL && typeof S3ImageURL === 'string' && !S3ImageURL.startsWith('http')) {
      const baseUrl = (process.env.BASE_URL || "").trim().replace(/^["']|["']$/g, "").replace(/\/$/, "");
      S3ImageURL = baseUrl + (S3ImageURL.startsWith('/') ? "" : "/") + S3ImageURL;
  }

  // const imageBuffer = await axios.get(`${process.env.BASE_URL}/${S3ImageURL}`, {
  //   responseType: "arraybuffer",
  // });
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
  //@ts-ignore
  let thumbnail = (thumbnailImg as any).Location || thumbnailImg.Key;
  if (thumbnail && typeof thumbnail === 'string' && !thumbnail.startsWith('http')) {
      const baseUrl = (process.env.BASE_URL || "").trim().replace(/^["']|["']$/g, "").replace(/\/$/, "");
      thumbnail = baseUrl + (thumbnail.startsWith('/') ? "" : "/") + thumbnail;
  }

  const image = new Image({
    _id,
    title: title,
    imageURL: S3ImageURL,
    thumbnail: thumbnail,
    description,
    userId: userId as string,
  });
  return await saveImage(image);
};
