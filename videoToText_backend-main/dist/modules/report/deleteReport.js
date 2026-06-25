"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReport = void 0;
const schema_1 = require("./schema");
/**
 * will delete user
 * @param _id
 */
const deleteReport = async (_id) => {
    await schema_1.ReportModel.findByIdAndDelete(_id);
};
exports.deleteReport = deleteReport;
//# sourceMappingURL=deleteReport.js.map