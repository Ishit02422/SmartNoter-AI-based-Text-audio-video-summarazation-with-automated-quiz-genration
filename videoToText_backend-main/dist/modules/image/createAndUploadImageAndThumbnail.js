"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAndUploadImageAndThumbnail = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const mongoose_1 = require("mongoose");
const sharp_1 = __importDefault(require("sharp"));
const _1 = require(".");
const saveImage_1 = require("./saveImage");
/**
 *
 * @param file UploadFileProps
 * @param title
 * @param description
 * @returns Image
 */
const createAndUploadImageAndThumbnail = async (
// eslint-disable-next-line @typescript-eslint/no-explicit-any
file, title, description, userId) => {
    const s3 = new client_s3_1.S3({
        endpoint: process.env.S3_END_POINT,
        region: process.env.AWS_REGION,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_KEY,
        },
    });
    const _id = new mongoose_1.Types.ObjectId().toString();
    const uploadedImage = await new lib_storage_1.Upload({
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
    let S3ImageURL = uploadedImage.Location || uploadedImage.Key;
    if (S3ImageURL && typeof S3ImageURL === 'string' && !S3ImageURL.startsWith('http')) {
        const baseUrl = (process.env.BASE_URL || "").trim().replace(/^["']|["']$/g, "").replace(/\/$/, "");
        S3ImageURL = baseUrl + (S3ImageURL.startsWith('/') ? "" : "/") + S3ImageURL;
    }
    // const imageBuffer = await axios.get(`${process.env.BASE_URL}/${S3ImageURL}`, {
    //   responseType: "arraybuffer",
    // });
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
    //@ts-ignore
    let thumbnail = thumbnailImg.Location || thumbnailImg.Key;
    if (thumbnail && typeof thumbnail === 'string' && !thumbnail.startsWith('http')) {
        const baseUrl = (process.env.BASE_URL || "").trim().replace(/^["']|["']$/g, "").replace(/\/$/, "");
        thumbnail = baseUrl + (thumbnail.startsWith('/') ? "" : "/") + thumbnail;
    }
    const image = new _1.Image({
        _id,
        title: title,
        imageURL: S3ImageURL,
        thumbnail: thumbnail,
        description,
        userId: userId,
    });
    return await (0, saveImage_1.saveImage)(image);
};
exports.createAndUploadImageAndThumbnail = createAndUploadImageAndThumbnail;
//# sourceMappingURL=createAndUploadImageAndThumbnail.js.map