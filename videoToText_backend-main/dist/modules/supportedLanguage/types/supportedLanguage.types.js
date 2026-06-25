"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupportedLanguage = void 0;
const lodash_1 = require("lodash");
class SupportedLanguage {
    constructor(input) {
        this._id = input._id;
        this.country = input.country;
        this.flag = input.flag;
        this.codeForText = input.codeForText;
        this.createdAt = input.createdAt;
        this.updatedAt = input.updatedAt;
    }
    toJSON() {
        return (0, lodash_1.omitBy)(this, lodash_1.isUndefined);
    }
    toComparable() {
        return (0, lodash_1.omitBy)(this, lodash_1.isNil);
    }
}
exports.SupportedLanguage = SupportedLanguage;
//# sourceMappingURL=supportedLanguage.types.js.map