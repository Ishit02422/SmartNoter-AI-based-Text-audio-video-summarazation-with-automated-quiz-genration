"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAndUploadThumbnail = void 0;
const mongoose_1 = require("mongoose");
const _1 = require(".");
const saveImage_1 = require("./saveImage");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const client_s3_1 = require("@aws-sdk/client-s3");
const sharp_1 = __importDefault(require("sharp"));
/**
 *
 * @param file UploadFileProps
 * @param title
 * @param description
 * @returns Image
 */
const createAndUploadThumbnail = async (
// eslint-disable-next-line @typescript-eslint/no-explicit-any
file, title, description, userId) => {
    var _a, _b;
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
    const thumbnailImg = await new lib_storage_1.Upload({
        client: s3,
        params: {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `images2/${Date.now()}_${_id}_thumbnail.png`,
            Body: thumbnailBuffer,
            ACL: "public-read",
        },
    }).done();
    //@ts-ignore
    const thumbnail = thumbnailImg.Location || (((_b = (_a = process.env.BASE_URL) === null || _a === void 0 ? void 0 : _a.trim()) === null || _b === void 0 ? void 0 : _b.replace(/\/$/, "")) + "/" + thumbnailImg.Key);
    const image = new _1.Image({
        _id,
        title: title,
        thumbnail: thumbnail,
        description,
        userId,
    });
    return await (0, saveImage_1.saveImage)(image);
};
exports.createAndUploadThumbnail = createAndUploadThumbnail;
//# sourceMappingURL=createAndUploadThumbnail.js.map