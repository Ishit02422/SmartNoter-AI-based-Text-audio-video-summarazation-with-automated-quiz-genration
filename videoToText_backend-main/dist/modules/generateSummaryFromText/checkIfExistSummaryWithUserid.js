"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkIfExistSummaryWithUserid = void 0;
const schema_1 = require("./schema");
/**
 * function for check summary data is store in database or not
 * @params userId
 * @returns data
 */
const checkIfExistSummaryWithUserid = async (userId) => {
    const data = await schema_1.GeneratedSummaryTextModel.findOne({
        userId,
    });
    return data;
};
exports.checkIfExistSummaryWithUserid = checkIfExistSummaryWithUserid;
//# sourceMappingURL=checkIfExistSummaryWithUserid.js.map