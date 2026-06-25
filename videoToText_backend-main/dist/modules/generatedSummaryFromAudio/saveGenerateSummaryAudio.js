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
    //   const savedGeneratedSummary = await new GeneratedSummaryAudioModel(
    //     generatedSummary.toJSON()
    //   ).save();
    const savedGeneratedSummary = await schema_1.GeneratedSummaryAudioModel.create(generatedSummary);
    return savedGeneratedSummary;
};
exports.saveGeneratedSummary = saveGeneratedSummary;
//# sourceMappingURL=saveGenerateSummaryAudio.js.map