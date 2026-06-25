"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Image = void 0;
const lodash_1 = require("lodash");
class Image {
    constructor(input) {
        this._id = input === null || input === void 0 ? void 0 : input._id;
        this.description = input === null || input === void 0 ? void 0 : input.description;
        this.title = input === null || input === void 0 ? void 0 : input.title;
        this.imageURL = input === null || input === void 0 ? void 0 : input.imageURL;
        this.thumbnail = input === null || input === void 0 ? void 0 : input.thumbnail;
        this.userId = input === null || input === void 0 ? void 0 : input.userId;
        this.createdAt = input === null || input === void 0 ? void 0 : input.createdAt;
        this.updatedAt = input === null || input === void 0 ? void 0 : input.updatedAt;
    }
    toJSON() {
        return (0, lodash_1.omitBy)(this, lodash_1.isUndefined);
    }
    toComparable() {
        return (0, lodash_1.omitBy)(this, lodash_1.isNil);
    }
}
exports.Image = Image;
//# sourceMappingURL=image.types.js.map