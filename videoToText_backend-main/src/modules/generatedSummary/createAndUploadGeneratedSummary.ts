import { Types } from "mongoose";
import { GeneratedSummary } from ".";
import { saveGeneratedSummary } from "./saveGeneratedSummary";
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
 * @returns GeneratedSummary
 */
export const createAndUploadGeneratedSummary = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  file: UploadFileProps | any
): Promise<GeneratedSummary> => {
  const s3 = new S3({
    endpoint: process.env.S3_END_POINT,
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
    },
  });
  const _id = new Types.ObjectId().toString();

  const uploadedGeneratedSummary = await new Upload({
    client: s3,

    params: {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `generatedSummarys/${Date.now() + "_" + _id + ".mp4"}`,
      Body: file,
      ACL: "public-read",
    },
  }).done();

  //@ts-ignore
  return uploadedGeneratedSummary.Key;
};
