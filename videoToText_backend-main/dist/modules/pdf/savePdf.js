"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.savePdf = void 0;
const schema_1 = require("./schema");
/**
 * function for save pdf in database
 * @param pdf
 * @returns pdf itself
 */
const savePdf = async (pdf) => {
    await new schema_1.PdfModel(pdf.toJSON()).save();
    return pdf;
};
exports.savePdf = savePdf;
//# sourceMappingURL=savePdf.js.map