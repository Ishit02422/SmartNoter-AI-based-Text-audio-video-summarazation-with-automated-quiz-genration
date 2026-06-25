"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveGeneratedSummaryFromWeb = void 0;
const schema_1 = require("./schema");
/**
 * function for save summary data store in database
 * @params generatedData
 * @returns generatedData itself
 */
const saveGeneratedSummaryFromWeb = async (generatedData) => {
    const savedSummaryData = await new schema_1.GeneratedSummaryWebModel(generatedData.toJSON()).save();
    return savedSummaryData;
};
exports.saveGeneratedSummaryFromWeb = saveGeneratedSummaryFromWeb;
//# sourceMappingURL=saveGeneratedSummary.js.map