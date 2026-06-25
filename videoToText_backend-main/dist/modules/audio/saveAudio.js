"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveAudio = void 0;
const schema_1 = require("./schema");
/**
 * function for save audio in database
 * @param audio
 * @returns audio itself
 */
const saveAudio = async (audio) => {
    await new schema_1.AudioModel(audio.toJSON()).save();
    return audio;
};
exports.saveAudio = saveAudio;
//# sourceMappingURL=saveAudio.js.map