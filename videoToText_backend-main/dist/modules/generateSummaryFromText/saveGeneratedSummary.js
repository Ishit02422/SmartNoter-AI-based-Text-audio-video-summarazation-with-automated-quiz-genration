"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveGeneratedSummaryFromText = void 0;
const schema_1 = require("./schema");
/**
 * function for save summary data store in database
 * @params generatedData
 * @returns generatedData itself
 */
const saveGeneratedSummaryFromText = async (generatedData) => {
    const savedSummaryData = await new schema_1.GeneratedSummaryTextModel(generatedData.toJSON()).save();
    return savedSummaryData;
};
exports.saveGeneratedSummaryFromText = saveGeneratedSummaryFromText;
//# sourceMappingURL=saveGeneratedSummary.js.map