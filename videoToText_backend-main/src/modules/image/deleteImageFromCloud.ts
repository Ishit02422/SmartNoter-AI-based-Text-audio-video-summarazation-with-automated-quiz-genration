import { S3 } from "@aws-sdk/client-s3";

/**
 * will delete image from cloud
 * @param url image url
 */

export const deleteImageFromCloud = async (key: string) => {
  const s3 = new S3({
    endpoint: process.env.S3_END_POINT,
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
    },
  });

  // const params = {
  //   Bucket: process.env.AWS_BUCKET_NAME,
  //   Key: key,
  // };

  // s3.deleteObject(params, (err, data) => {
  s3.deleteObject(
    {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    },
    (err: any, data: any) => {
      if (err) {
        console.error(err);
        return;
      }
    }
  );
};
