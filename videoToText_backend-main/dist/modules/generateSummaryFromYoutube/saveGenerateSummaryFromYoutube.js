"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveGeneratedSummaryFromYoutube = void 0;
const schema_1 = require("./schema");
/**
 * function for save summary data store in database
 * @params generatedData
 * @returns generatedData itself
 */
const saveGeneratedSummaryFromYoutube = async (generatedData) => {
    const savedSummaryData = await new schema_1.GeneratedSummaryModel(generatedData.toJSON()).save();
    return savedSummaryData;
};
exports.saveGeneratedSummaryFromYoutube = saveGeneratedSummaryFromYoutube;
//# sourceMappingURL=saveGenerateSummaryFromYoutube.js.map