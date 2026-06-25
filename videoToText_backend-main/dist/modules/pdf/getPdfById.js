"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPdfById = void 0;
const _1 = require(".");
const schema_1 = require("./schema");
/**
 *
 * @param _id
 * @returns relevant pdf
 */
const getPdfById = async (_id) => {
    const pdf = await schema_1.PdfModel.findById(_id);
    return pdf ? new _1.PDF(pdf) : null;
};
exports.getPdfById = getPdfById;
//# sourceMappingURL=getPdfById.js.map