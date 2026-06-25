"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllVideoSummary = void 0;
const schema_1 = require("./schema");
/**
 *
 * @param userId
 * @returns summaries
 */
const getAllVideoSummary = async (userId) => {
    const summaries = await schema_1.GeneratedSummaryModel.find({ userId });
    return summaries;
};
exports.getAllVideoSummary = getAllVideoSummary;
//# sourceMappingURL=getAllVideoSummary.js.map