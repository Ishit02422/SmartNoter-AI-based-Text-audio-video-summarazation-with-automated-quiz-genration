"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Report = void 0;
const lodash_1 = require("lodash");
const mongoose_1 = require("mongoose");
class Report {
    constructor(input) {
        this._id = (input === null || input === void 0 ? void 0 : input._id)
            ? input === null || input === void 0 ? void 0 : input._id.toString()
            : new mongoose_1.Types.ObjectId().toString();
        this.reason = input === null || input === void 0 ? void 0 : input.reason;
        this.generatedSummaryId = input === null || input === void 0 ? void 0 : input.generatedSummaryId;
        this.reportedBy = input === null || input === void 0 ? void 0 : input.reportedBy;
        this.createdAt = input === null || input === void 0 ? void 0 : input.createdAt;
        this.updatedAt = input === null || input === void 0 ? void 0 : input.updatedAt;
    }
    toJSON() {
        return (0, lodash_1.omitBy)(this, lodash_1.isUndefined);
    }
}
exports.Report = Report;
//# sourceMappingURL=report.types.js.map