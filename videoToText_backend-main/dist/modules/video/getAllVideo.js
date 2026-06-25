"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllAudio = void 0;
const audio_1 = require("../audio");
const schema_1 = require("../audio/schema");
/**
 *
 * @param name audio name
 * @returns relevant category record | null
 */
const getAllAudio = async (createdAt) => {
    const audio = await schema_1.AudioModel.find(createdAt);
    return audio ? audio.map((item) => new audio_1.Audio(item)) : null;
};
exports.getAllAudio = getAllAudio;
//# sourceMappingURL=getAllVideo.js.map