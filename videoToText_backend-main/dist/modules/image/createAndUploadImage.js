"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAndUploadImage = void 0;
const mongoose_1 = require("mongoose");
const _1 = require(".");
const saveImage_1 = require("./saveImage");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const client_s3_1 = require("@aws-sdk/client-s3");
/**
 *
 * @param file UploadFileProps
 * @param title
 * @param description
 * @returns Image
 */
const createAndUploadImage = async (
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
    let S3ImageURL = uploadedImage.Location || uploadedImage.Key;
    // Fix: DigitalOcean/S3 sometimes returns Location without protocol or as a full path
    // If it's already a full http/https URL, use it.
    // Otherwise, ensure we use the BASE_URL with the Key.
    if (S3ImageURL && !S3ImageURL.startsWith('http')) {
        const baseUrl = (process.env.BASE_URL || "").trim().replace(/^["']|["']$/g, "").replace(/\/$/, "");
        // If S3ImageURL contains the bucket name or endpoint, it might be the full path without protocol
        if (S3ImageURL.includes(process.env.AWS_BUCKET_NAME || "")) {
            S3ImageURL = "https://" + S3ImageURL;
        }
        else {
            S3ImageURL = baseUrl + (S3ImageURL.startsWith('/') ? "" : "/") + S3ImageURL;
        }
    }
    const image = new _1.Image({
        _id,
        title: title,
        imageURL: S3ImageURL,
        description,
        userId: userId,
    });
    return await (0, saveImage_1.saveImage)(image);
};
exports.createAndUploadImage = createAndUploadImage;
//# sourceMappingURL=createAndUploadImage.js.map