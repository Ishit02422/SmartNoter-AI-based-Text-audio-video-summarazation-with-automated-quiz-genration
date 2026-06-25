"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVideoById = void 0;
const _1 = require(".");
const schema_1 = require("./schema");
/**
 *
 * @param _id
 * @returns relevant video
 */
const getVideoById = async (_id) => {
    const video = await schema_1.VideoModel.findById(_id);
    return video ? new _1.Video(video) : null;
};
exports.getVideoById = getVideoById;
//# sourceMappingURL=getVideoById.js.map