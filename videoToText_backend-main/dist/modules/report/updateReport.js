"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateReport = void 0;
const schema_1 = require("./schema");
/**
 *
 * @param report
 * @returns update user record
 */
const updateReport = async (report) => {
    await schema_1.ReportModel.findByIdAndUpdate(report._id, report.toJSON());
    return report;
};
exports.updateReport = updateReport;
//# sourceMappingURL=updateReport.js.map