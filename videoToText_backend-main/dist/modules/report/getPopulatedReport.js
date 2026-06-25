"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPopulatedReport = void 0;
const types_1 = require("./types");
const schema_1 = require("./schema");
/**
 *
 * @param name report name
 * @returns relevant report record | null
 */
const getPopulatedReport = async () => {
    const report = await schema_1.ReportModel.find()
        .populate({
        path: "generatedImageId",
    })
        .populate({
        path: "reportedBy",
    });
    return report ? report.map((item) => new types_1.Report(item)) : null;
};
exports.getPopulatedReport = getPopulatedReport;
//# sourceMappingURL=getPopulatedReport.js.map