"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReportByUserId = void 0;
const types_1 = require("./types");
const schema_1 = require("./schema");
/**
 *
 * @param _id report id
 * @returns relevant report record | null
 */
const getReportByUserId = async (userId) => {
    const report = await schema_1.ReportModel.findOne({ reportedBy: userId });
    return report ? new types_1.Report(report) : null;
};
exports.getReportByUserId = getReportByUserId;
//# sourceMappingURL=getReportByUserId.js.map