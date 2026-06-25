"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveGeneratedSummary = void 0;
const schema_1 = require("./schema");
/**
 * function for save generatedSummary in database
 * @param generatedSummary
 * @returns generatedSummary itself
 */
const saveGeneratedSummary = async (generatedSummary) => {
    const savedGeneratedSummary = await new schema_1.GeneratedSummaryModel(generatedSummary.toJSON()).save();
    return savedGeneratedSummary;
};
exports.saveGeneratedSummary = saveGeneratedSummary;
//# sourceMappingURL=saveGeneratedSummary.js.map