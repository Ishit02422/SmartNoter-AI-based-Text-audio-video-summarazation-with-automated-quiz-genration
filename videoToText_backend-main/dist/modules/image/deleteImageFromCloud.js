"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteImageFromCloud = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
/**
 * will delete image from cloud
 * @param url image url
 */
const deleteImageFromCloud = async (key) => {
    const s3 = new client_s3_1.S3({
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
    s3.deleteObject({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
    }, (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
    });
};
exports.deleteImageFromCloud = deleteImageFromCloud;
//# sourceMappingURL=deleteImageFromCloud.js.map