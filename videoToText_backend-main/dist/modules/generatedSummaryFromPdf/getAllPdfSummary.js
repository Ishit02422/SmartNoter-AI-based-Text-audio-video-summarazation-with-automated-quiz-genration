"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllAudioSummary = void 0;
const schema_1 = require("./schema");
/**
 *
 * @param userId
 * @returns summaries
 */
const getAllAudioSummary = async (userId) => {
    const summaries = await schema_1.GenerateSummyPdfModel.find({ userId });
    return summaries;
};
exports.getAllAudioSummary = getAllAudioSummary;
//# sourceMappingURL=getAllPdfSummary.js.map