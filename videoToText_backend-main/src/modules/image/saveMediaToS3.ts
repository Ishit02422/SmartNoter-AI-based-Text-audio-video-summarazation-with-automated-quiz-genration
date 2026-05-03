import { Upload } from "@aws-sdk/lib-storage";
import { S3 } from "@aws-sdk/client-s3";
import { Types } from "mongoose";
import { StatusCodes } from "http-status-codes";
export const uploadMediaToS3 = async (
  bucketName: string,
  file: Buffer,
  mimetype: string,
  originalname: string
) => {
  try {
    if (!file) throw new Error("No files to upload");

    const s3 = new S3({
      endpoint: process.env.S3_END_POINT,
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
      },
    });

    // console.log("Uploading media to S3---->", originalname);

    const _id = new Types.ObjectId().toString();
    const uploadedMedia = await new Upload({
      client: s3,
      params: {
        ContentType: mimetype,
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${bucketName}/${originalname}`,
        Body: file,
        ACL: "public-read",
      },
    }).done();

    let finalUrl = (uploadedMedia as any).Location || uploadedMedia.Key;
    if (finalUrl && typeof finalUrl === 'string' && !finalUrl.startsWith('http')) {
        const baseUrl = (process.env.BASE_URL || "").trim().replace(/^["']|["']$/g, "").replace(/\/$/, "");
        finalUrl = baseUrl + (finalUrl.startsWith('/') ? "" : "/") + finalUrl;
    }
    return {
      _id: _id,
      url: finalUrl,
    };
  } catch (error) {
    console.log("Error while uploading media to S3", error);
    throw new Error(error.message);
  }
};
