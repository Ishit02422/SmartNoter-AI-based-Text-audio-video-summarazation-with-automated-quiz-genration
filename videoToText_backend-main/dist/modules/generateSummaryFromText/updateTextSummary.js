"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTextSummary = void 0;
const schema_1 = require("./schema");
/**
 *
 * @param summaryId
 * @param data
 * @returns editedSummary
 */
const updateTextSummary = async (summaryId, data) => {
    const editedSummary = await schema_1.GeneratedSummaryTextModel.findByIdAndUpdate(summaryId, data, { new: true });
    return editedSummary;
};
exports.updateTextSummary = updateTextSummary;
//# sourceMappingURL=updateTextSummary.js.map