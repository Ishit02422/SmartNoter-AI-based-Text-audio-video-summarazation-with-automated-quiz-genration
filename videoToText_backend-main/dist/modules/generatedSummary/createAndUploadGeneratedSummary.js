"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAndUploadGeneratedSummary = void 0;
const mongoose_1 = require("mongoose");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const client_s3_1 = require("@aws-sdk/client-s3");
/**
 *
 * @param file UploadFileProps
 * @param title
 * @param description
 * @returns GeneratedSummary
 */
const createAndUploadGeneratedSummary = async (
// eslint-disable-next-line @typescript-eslint/no-explicit-any
file) => {
    const s3 = new client_s3_1.S3({
        endpoint: process.env.S3_END_POINT,
        region: process.env.AWS_REGION,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_KEY,
        },
    });
    const _id = new mongoose_1.Types.ObjectId().toString();
    const uploadedGeneratedSummary = await new lib_storage_1.Upload({
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
exports.createAndUploadGeneratedSummary = createAndUploadGeneratedSummary;
//# sourceMappingURL=createAndUploadGeneratedSummary.js.map