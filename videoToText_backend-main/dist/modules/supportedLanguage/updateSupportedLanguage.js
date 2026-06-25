"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSupportedLanguage = void 0;
const schema_1 = require("./schema");
/**
 * function for save supportedLanguage in database
 * @param supportedLanguage
 * @returns supportedLanguage itself
 */
const updateSupportedLanguage = async (supportedLanguage) => {
    await schema_1.SupportedLanguageModel.findByIdAndUpdate(supportedLanguage._id, supportedLanguage.toJSON());
    return supportedLanguage;
};
exports.updateSupportedLanguage = updateSupportedLanguage;
//# sourceMappingURL=updateSupportedLanguage.js.map