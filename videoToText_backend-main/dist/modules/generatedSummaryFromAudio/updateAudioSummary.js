"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAudioSummary = void 0;
const schema_1 = require("./schema");
/**
 *
 * @param summaryId
 * @param data
 * @returns editedSummary
 */
const updateAudioSummary = async (summaryId, data) => {
    const editedSummary = await schema_1.GeneratedSummaryAudioModel.findByIdAndUpdate(summaryId, data, { new: true });
    return editedSummary;
};
exports.updateAudioSummary = updateAudioSummary;
//# sourceMappingURL=updateAudioSummary.js.map