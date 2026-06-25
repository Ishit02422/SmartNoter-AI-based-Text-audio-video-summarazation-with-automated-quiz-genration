"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveVideo = void 0;
const schema_1 = require("./schema");
/**
 * function for save audio in database
 * @param video
 * @returns video itself
 */
const saveVideo = async (video) => {
    await new schema_1.VideoModel(video.toJSON()).save();
    return video;
};
exports.saveVideo = saveVideo;
//# sourceMappingURL=saveVideo.js.map