"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateSummaryText = void 0;
const lodash_1 = require("lodash");
class GenerateSummaryText {
    constructor(input) {
        Object.assign(this, input);
    }
    toJSON() {
        return (0, lodash_1.omitBy)(this, lodash_1.isUndefined);
    }
    toComparable() {
        return (0, lodash_1.omitBy)(this, lodash_1.isNil);
    }
}
exports.GenerateSummaryText = GenerateSummaryText;
//# sourceMappingURL=generateSummaryText.js.map