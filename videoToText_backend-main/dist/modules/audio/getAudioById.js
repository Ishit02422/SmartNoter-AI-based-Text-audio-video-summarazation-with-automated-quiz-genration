"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAudioById = void 0;
const _1 = require(".");
const schema_1 = require("./schema");
/**
 *
 * @param _id
 * @returns relevant audio
 */
const getAudioById = async (_id) => {
    const audio = await schema_1.AudioModel.findById(_id);
    return audio ? new _1.Audio(audio) : null;
};
exports.getAudioById = getAudioById;
//# sourceMappingURL=getAudioById.js.map