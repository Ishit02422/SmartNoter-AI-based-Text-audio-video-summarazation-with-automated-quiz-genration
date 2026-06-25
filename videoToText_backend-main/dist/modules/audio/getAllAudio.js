"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllAudio = void 0;
const types_1 = require("./types");
const schema_1 = require("./schema");
/**
 *
 * @param name audio name
 * @returns relevant category record | null
 */
const getAllAudio = async (createdAt) => {
    const audio = await schema_1.AudioModel.find(createdAt);
    return audio ? audio.map((item) => new types_1.Audio(item)) : null;
};
exports.getAllAudio = getAllAudio;
//# sourceMappingURL=getAllAudio.js.map