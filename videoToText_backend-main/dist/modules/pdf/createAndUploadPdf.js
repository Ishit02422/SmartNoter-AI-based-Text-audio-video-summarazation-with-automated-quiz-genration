"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAndUploadPDF = void 0;
const mongoose_1 = require("mongoose");
// import { Audio, saveAudio } from "../audio";
const lib_storage_1 = require("@aws-sdk/lib-storage");
const client_s3_1 = require("@aws-sdk/client-s3");
const types_1 = require("./types");
const savePdf_1 = require("./savePdf");
/**
 *
 * @param file UploadFileProps
 * @param title
 * @returns PDF
 */
const createAndUploadPDF = async (
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
    const uploadedPdf = await new lib_storage_1.Upload({
        client: s3,
        params: {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `pdf/${Date.now() + "_" + _id + "_" + file.originalname}`,
            Body: file.buffer,
            ACL: "public-read",
        },
    }).done();
    //@ts-ignore
    const S3PdfURL = uploadedPdf.Location || (((_b = (_a = process.env.BASE_URL) === null || _a === void 0 ? void 0 : _a.trim()) === null || _b === void 0 ? void 0 : _b.replace(/\/$/, "")) + "/" + uploadedPdf.Key);
    const pdf = new types_1.PDF({
        _id,
        title: title,
        pdfURL: S3PdfURL,
        userId,
    });
    return await (0, savePdf_1.savePdf)(pdf);
};
exports.createAndUploadPDF = createAndUploadPDF;
//# sourceMappingURL=createAndUploadPdf.js.map