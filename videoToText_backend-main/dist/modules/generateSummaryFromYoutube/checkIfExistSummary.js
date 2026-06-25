"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkVideoSummaryIsExistById = void 0;
const schema_1 = require("./schema");
/**
 * function for check summary data is store in database or not
 * @params summaryId
 * @params userId
 * @returns data
 */
const checkVideoSummaryIsExistById = async (summaryId, userId) => {
    const data = await schema_1.GeneratedSummaryModel.findOne({ _id: summaryId, userId });
    return data;
};
exports.checkVideoSummaryIsExistById = checkVideoSummaryIsExistById;
//# sourceMappingURL=checkIfExistSummary.js.map