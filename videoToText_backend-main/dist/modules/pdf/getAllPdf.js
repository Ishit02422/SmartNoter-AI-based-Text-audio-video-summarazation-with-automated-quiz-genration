"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllPdf = void 0;
const types_1 = require("./types");
const schema_1 = require("./schema");
/**
 *
 * @param name pdf name
 * @returns relevant category record | null
 */
const getAllPdf = async (createdAt) => {
    const pdf = await schema_1.PdfModel.find(createdAt);
    return pdf ? pdf.map((item) => new types_1.PDF(item)) : null;
};
exports.getAllPdf = getAllPdf;
//# sourceMappingURL=getAllPdf.js.map