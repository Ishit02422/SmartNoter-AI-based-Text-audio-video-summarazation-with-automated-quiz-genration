"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportModel = void 0;
const mongoose_1 = require("mongoose");
const report = new mongoose_1.Schema({
    reason: {
        type: String,
    },
    generatedSummaryId: {
        type: mongoose_1.Types.ObjectId,
        ref: "generatedSummary",
        default: null,
    },
    reportedBy: {
        type: mongoose_1.Types.ObjectId,
        ref: "users",
        default: null,
    },
}, { timestamps: true });
exports.ReportModel = (0, mongoose_1.model)("report", report);
//# sourceMappingURL=report.schema.js.map