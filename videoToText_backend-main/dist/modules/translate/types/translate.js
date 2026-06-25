"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Translate = void 0;
const lodash_1 = require("lodash");
class Translate {
    constructor(input) {
        Object.assign(this, input);
    }
    toJSON() {
        return (0, lodash_1.omitBy)(this, lodash_1.isUndefined);
    }
}
exports.Translate = Translate;
//# sourceMappingURL=translate.js.map