"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkWebSummaryIsExistById = void 0;
const schema_1 = require("./schema");
/**
 * function for check summary data is store in database or not
 * @params summaryId
 * @params userId
 * @returns data
 */
const checkWebSummaryIsExistById = async (summaryId, userId) => {
    const data = await schema_1.GeneratedSummaryWebModel.findOne({
        _id: summaryId,
        userId,
    });
    return data;
};
exports.checkWebSummaryIsExistById = checkWebSummaryIsExistById;
//# sourceMappingURL=checkIfExistSummary.js.map