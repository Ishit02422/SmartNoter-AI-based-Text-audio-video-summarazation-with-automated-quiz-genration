"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGeneratedSummaryById = void 0;
const schema_1 = require("./schema");
/**
 *
 * @param name generatedSummary name
 * @returns relevant category record | null
 */
const getGeneratedSummaryById = async (_id) => {
    const generatedSummary = await schema_1.GeneratedSummaryModel.findOne({ _id }).lean();
    return generatedSummary ? generatedSummary : null;
};
exports.getGeneratedSummaryById = getGeneratedSummaryById;
//# sourceMappingURL=getGeneratedSummaryById.js.map