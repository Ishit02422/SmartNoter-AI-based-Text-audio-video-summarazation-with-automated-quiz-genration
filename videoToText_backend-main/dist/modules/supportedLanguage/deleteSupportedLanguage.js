"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSupportedLanguage = void 0;
const schema_1 = require("./schema");
/**
 *
 * @param supportedLanguage supportedLanguage class
 */
const deleteSupportedLanguage = async (supportedLanguageId) => {
    await schema_1.SupportedLanguageModel.findByIdAndDelete(supportedLanguageId);
};
exports.deleteSupportedLanguage = deleteSupportedLanguage;
//# sourceMappingURL=deleteSupportedLanguage.js.map