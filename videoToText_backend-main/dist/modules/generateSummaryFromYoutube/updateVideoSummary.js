"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateVideoSummary = void 0;
const schema_1 = require("./schema");
/**
 *
 * @param summaryId
 * @param data
 * @returns editedSummary
 */
const updateVideoSummary = async (summaryId, data) => {
    const editedSummary = await schema_1.GeneratedSummaryModel.findByIdAndUpdate(summaryId, data, { new: true });
    return editedSummary;
};
exports.updateVideoSummary = updateVideoSummary;
//# sourceMappingURL=updateVideoSummary.js.map