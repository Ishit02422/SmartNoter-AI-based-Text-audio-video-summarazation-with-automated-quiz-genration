"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAudio = void 0;
const schema_1 = require("./schema");
/**
 *
 * @param pdf pdf class
 */
const deleteAudio = async (pdf) => {
    await schema_1.PdfModel.findByIdAndDelete(pdf._id.toString());
};
exports.deleteAudio = deleteAudio;
//# sourceMappingURL=deletePdf.js.map