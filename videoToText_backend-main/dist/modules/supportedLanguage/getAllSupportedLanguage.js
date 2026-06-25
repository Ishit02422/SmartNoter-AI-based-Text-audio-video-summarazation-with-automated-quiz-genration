"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllSupportedLanguage = void 0;
const types_1 = require("./types");
const schema_1 = require("./schema");
/**
 *
 * @param name supportedLanguage name
 * @returns relevant category record | null
 */
const getAllSupportedLanguage = async () => {
    const supportedLanguage = await schema_1.SupportedLanguageModel.find().populate({
        path: "flag",
    });
    return supportedLanguage
        ? supportedLanguage.map((item) => new types_1.SupportedLanguage(item))
        : null;
};
exports.getAllSupportedLanguage = getAllSupportedLanguage;
//# sourceMappingURL=getAllSupportedLanguage.js.map