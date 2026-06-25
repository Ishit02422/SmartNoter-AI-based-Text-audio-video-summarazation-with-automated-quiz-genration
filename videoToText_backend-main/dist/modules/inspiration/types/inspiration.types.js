"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Inspiration = void 0;
const lodash_1 = require("lodash");
const mongoose_1 = require("mongoose");
class Inspiration {
    constructor(input) {
        this._id = input._id
            ? input._id.toString()
            : new mongoose_1.Types.ObjectId().toString();
        this.generatedSummaryId = input.generatedSummaryId;
        this.category = input.category;
        this.createdAt = input.createdAt;
        this.updatedAt = input.updatedAt;
    }
    toJSON() {
        return (0, lodash_1.omitBy)(this, lodash_1.isUndefined);
    }
}
exports.Inspiration = Inspiration;
//# sourceMappingURL=inspiration.types.js.map