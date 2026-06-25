"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteManyGeneratedSummarys = void 0;
const schema_1 = require("./schema");
/**
 *
 * @param generatedSummary class
 */
const deleteManyGeneratedSummarys = async (createdAt) => {
    await schema_1.GeneratedSummaryModel.deleteMany(createdAt);
};
exports.deleteManyGeneratedSummarys = deleteManyGeneratedSummarys;
//# sourceMappingURL=deleteManyGeneratedSummary%20copy.js.map