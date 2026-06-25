"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAndUploadVideo = void 0;
const mongoose_1 = require("mongoose");
const _1 = require(".");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const client_s3_1 = require("@aws-sdk/client-s3");
/**
 *
 * @param file UploadFileProps
 * @param title
 * @returns Video
 */
const createAndUploadVideo = async (
// eslint-disable-next-line @typescript-eslint/no-explicit-any
file, title, userId) => {
    const s3 = new client_s3_1.S3({
        endpoint: process.env.S3_END_POINT,
        region: process.env.AWS_REGION,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_KEY,
        },
    });
    const _id = new mongoose_1.Types.ObjectId().toString();
    const uploadedVideo = await new lib_storage_1.Upload({
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
    const video = new _1.Video({
        _id,
        title: title,
        videoURL: S3AudioURL,
        userId,
    });
    return await (0, _1.saveVideo)(video);
};
exports.createAndUploadVideo = createAndUploadVideo;
//# sourceMappingURL=createAndUploadVideo.js.map