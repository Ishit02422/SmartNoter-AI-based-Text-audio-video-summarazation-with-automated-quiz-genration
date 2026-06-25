"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkTextSummaryIsExistById = void 0;
const schema_1 = require("./schema");
/**
 * function for check summary data is store in database or not
 * @params summaryId
 * @params userId
 * @returns data
 */
const checkTextSummaryIsExistById = async (summaryId, userId) => {
    const data = await schema_1.GeneratedSummaryTextModel.findOne({
        _id: summaryId,
        userId,
    });
    return data;
};
exports.checkTextSummaryIsExistById = checkTextSummaryIsExistById;
//# sourceMappingURL=checkIfExistSummary.js.map