"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateWebSummary = void 0;
const schema_1 = require("./schema");
/**
 *
 * @param summaryId
 * @param data
 * @returns editedSummary
 */
const updateWebSummary = async (summaryId, data) => {
    const editedSummary = await schema_1.GeneratedSummaryWebModel.findByIdAndUpdate(summaryId, data, { new: true });
    return editedSummary;
};
exports.updateWebSummary = updateWebSummary;
//# sourceMappingURL=updateWebSummary.js.map