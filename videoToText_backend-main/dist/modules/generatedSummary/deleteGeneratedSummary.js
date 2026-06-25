"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteGeneratedSummary = void 0;
const schema_1 = require("./schema");
/**
 *
 * @param generatedSummary generatedSummary class
 */
const deleteGeneratedSummary = async (generatedSummary) => {
    await schema_1.GeneratedSummaryModel.findByIdAndDelete(generatedSummary._id.toString());
};
exports.deleteGeneratedSummary = deleteGeneratedSummary;
//# sourceMappingURL=deleteGeneratedSummary.js.map