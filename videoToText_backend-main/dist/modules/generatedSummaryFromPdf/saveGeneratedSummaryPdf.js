"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveGeneratedSummaryFromPDF = void 0;
const schema_1 = require("./schema");
/**
 * function for save summary data store in database
 * @params generatedData
 * @returns generatedData itself
 */
const saveGeneratedSummaryFromPDF = async (generatedData) => {
    const savedGeneratedSummary = await schema_1.GenerateSummyPdfModel.create(generatedData);
    return savedGeneratedSummary;
};
exports.saveGeneratedSummaryFromPDF = saveGeneratedSummaryFromPDF;
//# sourceMappingURL=saveGeneratedSummaryPdf.js.map