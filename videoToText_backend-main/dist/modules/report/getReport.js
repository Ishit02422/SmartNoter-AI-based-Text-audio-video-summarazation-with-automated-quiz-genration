"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReport = void 0;
const types_1 = require("./types");
const schema_1 = require("./schema");
/**
 *
 * @param name report name
 * @returns relevant report record | null
 */
const getReport = async () => {
    const report = await schema_1.ReportModel.find().populate({
        path: "thumbnail",
    });
    return report ? report.map((item) => new types_1.Report(item)) : null;
};
exports.getReport = getReport;
//# sourceMappingURL=getReport.js.map