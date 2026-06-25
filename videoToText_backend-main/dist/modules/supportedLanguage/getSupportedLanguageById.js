"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSupportedLanguageById = void 0;
const _1 = require(".");
const schema_1 = require("./schema");
/**
 *
 * @param _id
 * @returns relevant supportedLanguage
 */
const getSupportedLanguageById = async (_id) => {
    const supportedLanguage = await schema_1.SupportedLanguageModel.findById(_id);
    return supportedLanguage ? new _1.SupportedLanguage(supportedLanguage) : null;
};
exports.getSupportedLanguageById = getSupportedLanguageById;
//# sourceMappingURL=getSupportedLanguageById.js.map