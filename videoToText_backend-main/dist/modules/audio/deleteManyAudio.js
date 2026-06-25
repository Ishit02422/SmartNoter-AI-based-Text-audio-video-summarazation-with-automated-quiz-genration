"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteManyAudios = void 0;
const schema_1 = require("./schema");
/**
 *
 * @param audio class
 */
const deleteManyAudios = async (createdAt) => {
    await schema_1.AudioModel.deleteMany(createdAt);
};
exports.deleteManyAudios = deleteManyAudios;
//# sourceMappingURL=deleteManyAudio.js.map