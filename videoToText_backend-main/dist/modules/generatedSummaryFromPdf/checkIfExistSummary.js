"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPdfSummaryIsExistById = void 0;
const schema_1 = require("./schema");
/**
 * function for check summary data is store in database or not
 * @params summaryId
 * @params userId
 * @returns data
 */
const checkPdfSummaryIsExistById = async (summaryId, userId) => {
    const data = await schema_1.GenerateSummyPdfModel.findOne({ _id: summaryId, userId });
    return data;
};
exports.checkPdfSummaryIsExistById = checkPdfSummaryIsExistById;
//# sourceMappingURL=checkIfExistSummary.js.map