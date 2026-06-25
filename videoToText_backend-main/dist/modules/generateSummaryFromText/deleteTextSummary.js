"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletedSummary = void 0;
const schema_1 = require("./schema");
/**
 *
 * @param summaryId
 */
const deletedSummary = async (summaryId) => {
    const deletedSummary = await schema_1.GeneratedSummaryTextModel.findByIdAndDelete(summaryId);
    return deletedSummary;
};
exports.deletedSummary = deletedSummary;
//# sourceMappingURL=deleteTextSummary.js.map