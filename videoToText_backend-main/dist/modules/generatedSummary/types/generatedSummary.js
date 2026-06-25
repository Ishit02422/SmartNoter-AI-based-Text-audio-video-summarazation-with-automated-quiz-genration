"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeneratedSummary = void 0;
const lodash_1 = require("lodash");
class GeneratedSummary {
    constructor(input) {
        this._id = input._id;
        this.summary_duration = input.summary_duration;
        this.duration = input.duration;
        this.language = input.language;
        this.model = input.model;
        this.audioUrl = input.audioUrl;
        this.summaryId = input.summaryId;
        this.transcript = input.transcript;
        this.summarization = input.summarization;
        this.pii_redaction = input.pii_redaction;
        this.content_moderation = input.content_moderation;
        this.sentiment_nalysis = input.sentiment_nalysis;
        this.entity_detection = input.entity_detection;
        this.topic_detection = input.topic_detection;
        this.auto_chapters = input.auto_chapters;
        this.key_phrases = input.key_phrases;
        this.userId = input.userId;
        this.imageId = input.imageId;
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
exports.GeneratedSummary = GeneratedSummary;
//# sourceMappingURL=generatedSummary.js.map