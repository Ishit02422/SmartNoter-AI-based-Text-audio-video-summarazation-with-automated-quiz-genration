"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAndUploadAudio = void 0;
const mongoose_1 = require("mongoose");
const audio_1 = require("../audio");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const client_s3_1 = require("@aws-sdk/client-s3");
/**
 *
 * @param file UploadFileProps
 * @param title
 * @returns Audio
 */
const createAndUploadAudio = async (
// eslint-disable-next-line @typescript-eslint/no-explicit-any
file, title, userId) => {
    var _a, _b;
    const s3Config = {
        region: process.env.AWS_REGION || "us-east-1",
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY || "",
            secretAccessKey: process.env.AWS_SECRET_KEY || "",
        },
    };
    if (process.env.S3_END_POINT) {
        s3Config.endpoint = process.env.S3_END_POINT;
    }
    const s3 = new client_s3_1.S3(s3Config);
    const _id = new mongoose_1.Types.ObjectId().toString();
    const uploadedAudio = await new lib_storage_1.Upload({
        client: s3,
        params: {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `audios2/${Date.now() + "_" + _id + "_" + file.originalname}`,
            Body: file.buffer,
            ACL: "public-read",
        },
    }).done();
    //@ts-ignore
    const S3AudioURL = uploadedAudio.Location || (((_b = (_a = process.env.BASE_URL) === null || _a === void 0 ? void 0 : _a.trim()) === null || _b === void 0 ? void 0 : _b.replace(/\/$/, "")) + "/" + uploadedAudio.Key);
    const audio = new audio_1.Audio({
        _id,
        title: title,
        audioURL: S3AudioURL,
        userId: userId,
    });
    return await (0, audio_1.saveAudio)(audio);
};
exports.createAndUploadAudio = createAndUploadAudio;
//# sourceMappingURL=createAndUploadAudio.js.map