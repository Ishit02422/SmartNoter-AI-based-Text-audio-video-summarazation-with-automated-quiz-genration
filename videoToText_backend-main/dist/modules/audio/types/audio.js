"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Audio = void 0;
const lodash_1 = require("lodash");
class Audio {
    constructor(input) {
        this._id = input._id;
        this.title = input.title;
        this.url = input.url;
        this.audioURL = input.audioURL;
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
exports.Audio = Audio;
//# sourceMappingURL=audio.js.map