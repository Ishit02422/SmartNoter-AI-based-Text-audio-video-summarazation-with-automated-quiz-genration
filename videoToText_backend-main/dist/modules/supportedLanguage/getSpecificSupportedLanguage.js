"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSpecificSupportedLanguage = void 0;
const types_1 = require("./types");
const schema_1 = require("./schema");
/**
 *
 * @param name supportedLanguage name
 * @returns relevant category record | null
 */
const getSpecificSupportedLanguage = async (query) => {
    const supportedLanguage = await schema_1.SupportedLanguageModel.find(query);
    return supportedLanguage
        ? supportedLanguage.map((item) => new types_1.SupportedLanguage(item))
        : null;
};
exports.getSpecificSupportedLanguage = getSpecificSupportedLanguage;
//# sourceMappingURL=getSpecificSupportedLanguage.js.map