"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateGeneratedSummary = void 0;
const schema_1 = require("./schema");
const updateGeneratedSummary = async (generatedSummary) => {
    await schema_1.GeneratedSummaryModel.findByIdAndUpdate(generatedSummary._id, generatedSummary.toJSON());
    return generatedSummary;
};
exports.updateGeneratedSummary = updateGeneratedSummary;
//# sourceMappingURL=updateGeneratedSummary.js.map