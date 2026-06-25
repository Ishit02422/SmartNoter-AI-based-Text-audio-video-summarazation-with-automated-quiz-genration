"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveSupportedLanguage = void 0;
const schema_1 = require("./schema");
/**
 * function for save supportedLanguage in database
 * @param supportedLanguage
 * @returns supportedLanguage itself
 */
const saveSupportedLanguage = async (supportedLanguage) => {
    const data = await new schema_1.SupportedLanguageModel(supportedLanguage.toJSON()).save();
    return data;
};
exports.saveSupportedLanguage = saveSupportedLanguage;
//# sourceMappingURL=saveSupportedLanguage.js.map