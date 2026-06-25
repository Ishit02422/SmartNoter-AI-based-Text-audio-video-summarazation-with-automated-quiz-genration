"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAudio = void 0;
const schema_1 = require("./schema");
/**
 *
 * @param audio audio class
 */
const deleteAudio = async (audio) => {
    await schema_1.AudioModel.findByIdAndDelete(audio._id.toString());
};
exports.deleteAudio = deleteAudio;
//# sourceMappingURL=deleteAudio.js.map