"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMediaToS3 = void 0;
const lib_storage_1 = require("@aws-sdk/lib-storage");
const client_s3_1 = require("@aws-sdk/client-s3");
const mongoose_1 = require("mongoose");
const uploadMediaToS3 = async (bucketName, file, mimetype, originalname) => {
    try {
        if (!file)
            throw new Error("No files to upload");
        const s3 = new client_s3_1.S3({
            endpoint: process.env.S3_END_POINT,
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY,
                secretAccessKey: process.env.AWS_SECRET_KEY,
            },
        });
        // console.log("Uploading media to S3---->", originalname);
        const _id = new mongoose_1.Types.ObjectId().toString();
        const uploadedMedia = await new lib_storage_1.Upload({
            client: s3,
            params: {
                ContentType: mimetype,
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: `${bucketName}/${originalname}`,
                Body: file,
                ACL: "public-read",
            },
        }).done();
        let finalUrl = uploadedMedia.Location || uploadedMedia.Key;
        if (finalUrl && typeof finalUrl === 'string' && !finalUrl.startsWith('http')) {
            const baseUrl = (process.env.BASE_URL || "").trim().replace(/^["']|["']$/g, "").replace(/\/$/, "");
            finalUrl = baseUrl + (finalUrl.startsWith('/') ? "" : "/") + finalUrl;
        }
        return {
            _id: _id,
            url: finalUrl,
        };
    }
    catch (error) {
        console.log("Error while uploading media to S3", error);
        throw new Error(error.message);
    }
};
exports.uploadMediaToS3 = uploadMediaToS3;
//# sourceMappingURL=saveMediaToS3.js.map