"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllTextSummary = void 0;
const schema_1 = require("./schema");
/**
 *
 * @param userId
 * @returns summaries
 */
const getAllTextSummary = async (userId) => {
    const summaries = await schema_1.GeneratedSummaryTextModel.find({ userId });
    return summaries;
};
exports.getAllTextSummary = getAllTextSummary;
//# sourceMappingURL=getAllTextSummary.js.map