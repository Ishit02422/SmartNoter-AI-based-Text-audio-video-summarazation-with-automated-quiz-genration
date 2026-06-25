"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupportedLanguageModel = void 0;
const mongoose_1 = require("mongoose");
const supportedLanguage = new mongoose_1.Schema({
    country: {
        type: String,
        default: "",
    },
    flag: {
        type: String,
        // ref: "image",
        default: "",
    },
    codeForText: {
        type: String,
        default: "",
    },
}, { timestamps: true });
exports.SupportedLanguageModel = (0, mongoose_1.model)("supportedLanguage", supportedLanguage);
//# sourceMappingURL=supportedLanguage.schema.js.map