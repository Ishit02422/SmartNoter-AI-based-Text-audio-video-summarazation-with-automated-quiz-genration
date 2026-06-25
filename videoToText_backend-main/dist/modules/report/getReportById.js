"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReportById = void 0;
const types_1 = require("./types");
const schema_1 = require("./schema");
/**
 *
 * @param _id report id
 * @returns relevant report record | null
 */
const getReportById = async (_id) => {
    const report = await schema_1.ReportModel.findById(_id).populate({
        path: "thumbnail",
    });
    return report ? new types_1.Report(report) : null;
};
exports.getReportById = getReportById;
//# sourceMappingURL=getReportById.js.map