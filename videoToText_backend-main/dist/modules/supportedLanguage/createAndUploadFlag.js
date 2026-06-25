"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAndUploadFlag = void 0;
const mongoose_1 = require("mongoose");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const client_s3_1 = require("@aws-sdk/client-s3");
const sharp_1 = __importDefault(require("sharp"));
/**
 *
 * @param file UploadFileProps
 * @param title
 * @param description
 * @returns Document
 */
const createAndUploadFlag = async (
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
    const thumbnailBuffer = await (0, sharp_1.default)(file.buffer)
        .toFormat("png")
        .jpeg({ quality: 40 })
        .toBuffer();
    const uploadedDocument = await new lib_storage_1.Upload({
        client: s3,
        params: {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `flags/${Date.now() + "_" + _id}.png`,
            Body: thumbnailBuffer,
            ACL: "public-read",
        },
    }).done();
    //@ts-ignore
    return uploadedDocument.Key;
};
exports.createAndUploadFlag = createAndUploadFlag;
//# sourceMappingURL=createAndUploadFlag.js.map