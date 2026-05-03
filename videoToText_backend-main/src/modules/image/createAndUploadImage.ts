import { Types } from "mongoose";
import { Image } from ".";
import { saveImage } from "./saveImage";
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
 * @param description
 * @returns Image
 */
export const createAndUploadImage = async (
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
  let S3ImageURL = (uploadedImage as any).Location || uploadedImage.Key;
  
  // Fix: DigitalOcean/S3 sometimes returns Location without protocol or as a full path
  // If it's already a full http/https URL, use it.
  // Otherwise, ensure we use the BASE_URL with the Key.
  if (S3ImageURL && !S3ImageURL.startsWith('http')) {
      const baseUrl = (process.env.BASE_URL || "").trim().replace(/^["']|["']$/g, "").replace(/\/$/, "");
      // If S3ImageURL contains the bucket name or endpoint, it might be the full path without protocol
      if (S3ImageURL.includes(process.env.AWS_BUCKET_NAME || "")) {
          S3ImageURL = "https://" + S3ImageURL;
      } else {
          S3ImageURL = baseUrl + (S3ImageURL.startsWith('/') ? "" : "/") + S3ImageURL;
      }
  }
  const image = new Image({
    _id,
    title: title,
    imageURL: S3ImageURL,
    description,
    userId: userId as string,
  });
  return await saveImage(image);
};
