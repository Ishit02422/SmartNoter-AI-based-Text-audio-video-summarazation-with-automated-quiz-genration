"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePdfSummary = void 0;
const schema_1 = require("./schema");
/**
 *
 * @param summaryId
 * @param data
 * @returns editedSummary
 */
const updatePdfSummary = async (summaryId, data) => {
    const editedSummary = await schema_1.GenerateSummyPdfModel.findByIdAndUpdate(summaryId, data, { new: true });
    return editedSummary;
};
exports.updatePdfSummary = updatePdfSummary;
//# sourceMappingURL=updatePdfSummary.js.map