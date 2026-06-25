"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeneratedSummaryVideo = void 0;
const lodash_1 = require("lodash");
class GeneratedSummaryVideo {
    constructor(input) {
        this._id = input._id;
        this.videoId = input.videoId;
        this.sourceType = input.sourceType;
        this.summary_models = input.summary_models;
        this.summary_types = input.summary_types;
        this.title = input.title;
        this.videoUrl = input.videoUrl;
        this.folderId = input.folderId;
        this.aiResponse = input.aiResponse;
        this.transcript = input.transcript;
        this.summarization = input.summarization;
        this.language = input.language;
        this.model = input.model;
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
exports.GeneratedSummaryVideo = GeneratedSummaryVideo;
//# sourceMappingURL=generatedSummaryVideo.js.map