"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTranslatedSummary = void 0;
const schema_1 = require("./schema");
const getTranslatedSummary = async (summaryId, source, language, userId) => {
    const result = await schema_1.TranslateModel.findOne({
        summaryId,
        source,
        translatedLanguage: language,
        userId,
    });
    return result;
};
exports.getTranslatedSummary = getTranslatedSummary;
//# sourceMappingURL=getTranslatedSummary.js.map