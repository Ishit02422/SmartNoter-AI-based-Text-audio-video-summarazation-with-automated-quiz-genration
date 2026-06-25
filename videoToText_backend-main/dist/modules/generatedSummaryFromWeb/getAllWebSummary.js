"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllWebSummary = void 0;
const schema_1 = require("./schema");
/**
 *
 * @param userId
 * @returns summaries
 */
const getAllWebSummary = async (userId) => {
    const summaries = await schema_1.GeneratedSummaryWebModel.find({ userId });
    return summaries;
};
exports.getAllWebSummary = getAllWebSummary;
//# sourceMappingURL=getAllWebSummary.js.map