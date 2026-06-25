"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PDF = void 0;
const lodash_1 = require("lodash");
class PDF {
    constructor(input) {
        this._id = input._id;
        this.title = input.title;
        this.url = input.url;
        this.pdfURL = input.pdfURL;
        this.userId = input.userId;
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
exports.PDF = PDF;
//# sourceMappingURL=pdf.js.map