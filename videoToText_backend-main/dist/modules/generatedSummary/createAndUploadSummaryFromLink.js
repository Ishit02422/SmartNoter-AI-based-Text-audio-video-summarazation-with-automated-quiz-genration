"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAndUploadSummaryFromLink = void 0;
const axios_1 = __importDefault(require("axios"));
const _1 = require(".");
/**
 *
 * @param imageUrl
 * @param title
 * @returns
 */
const createAndUploadSummaryFromLink = async (imageUrl) => {
    try {
        // Download the image
        // return
        const image = await axios_1.default.get(imageUrl, { responseType: "arraybuffer" });
        const downloadedImage = await (0, _1.createAndUploadGeneratedSummary)(image.data);
        return downloadedImage;
    }
    catch (err) {
        console.log("########## Error in createAndUploadSummaryFromLink", err);
    }
};
exports.createAndUploadSummaryFromLink = createAndUploadSummaryFromLink;
//# sourceMappingURL=createAndUploadSummaryFromLink.js.map