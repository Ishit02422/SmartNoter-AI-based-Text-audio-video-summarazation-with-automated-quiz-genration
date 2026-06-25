"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGeneratedSummaryByUserId = void 0;
const types_1 = require("./types");
const schema_1 = require("./schema");
/**
 *
 * @param name generatedSummary name
 * @returns relevant category record | null
 */
const getGeneratedSummaryByUserId = async (userId, page, limit) => {
    const generatedSummary = await schema_1.GeneratedSummaryModel.find({ userId })
        .lean()
        .populate({ path: "imageId" })
        .skip((page - 1) * limit)
        .limit(limit);
    return generatedSummary
        ? generatedSummary.map((item) => new types_1.GeneratedSummary(item))
        : null;
};
exports.getGeneratedSummaryByUserId = getGeneratedSummaryByUserId;
//# sourceMappingURL=getGeneratedSummaryByUserId.js.map