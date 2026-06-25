"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.filesUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.memoryStorage(); // Store files in memory instead of on disk
const upload = (0, multer_1.default)({
    storage: storage,
    // limits: {
    //   fileSize: 10 * 1024 * 1024, // Limit file size to 10MB
    // },
});
const filesUpload = (req, res, next) => {
    upload.array("file", 1)(req, res, async (err) => {
        if (err) {
            return next(err);
        }
        // const files = req.files.map((file) => ({
        //   fieldname: file.fieldname,
        //   originalname: file.originalname,
        //   encoding: file.encoding,
        //   mimeType: file.mimetype,
        //   buffer: file.buffer, // Get the buffer of the file
        //   size: file.size,
        //   filename: file.originalname,
        // }));
        req.body = req.body || {};
        req.body.files = req.files;
        next();
    });
};
exports.filesUpload = filesUpload;
//# sourceMappingURL=filesUpload.js.map