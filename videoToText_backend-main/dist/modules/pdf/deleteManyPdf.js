"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteManyPdf = void 0;
const schema_1 = require("./schema");
/**
 *
 * @param pdf class
 */
const deleteManyPdf = async (createdAt) => {
    await schema_1.PdfModel.deleteMany(createdAt);
};
exports.deleteManyPdf = deleteManyPdf;
//# sourceMappingURL=deleteManyPdf.js.map