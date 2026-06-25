"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveTranslatedSummary = void 0;
const schema_1 = require("./schema");
const saveTranslatedSummary = async (data) => {
    const result = await schema_1.TranslateModel.create(data);
    return result;
};
exports.saveTranslatedSummary = saveTranslatedSummary;
//# sourceMappingURL=saveTranslatedSummary.js.map