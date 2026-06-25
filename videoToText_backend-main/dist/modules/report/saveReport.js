"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveReport = void 0;
const schema_1 = require("./schema");
/**
 *
 * @param report  class
 * @returns created report
 */
const saveReport = async (report) => {
    const savedReport = await new schema_1.ReportModel(report.toJSON()).save();
    return savedReport;
};
exports.saveReport = saveReport;
//# sourceMappingURL=saveReport.js.map