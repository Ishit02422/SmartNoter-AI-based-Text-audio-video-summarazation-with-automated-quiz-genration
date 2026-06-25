"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAudioSummaryIsExistById = void 0;
const schema_1 = require("./schema");
/**
 * function for check summary data is store in database or not
 * @params summaryId
 * @params userId
 * @returns data
 */
const checkAudioSummaryIsExistById = async (summaryId, userId) => {
    const data = await schema_1.GeneratedSummaryAudioModel.findOne({
        _id: summaryId,
        userId,
    });
    return data;
};
exports.checkAudioSummaryIsExistById = checkAudioSummaryIsExistById;
//# sourceMappingURL=checkIfExistSummary.js.map