"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeneratedSummaryAudio = void 0;
const lodash_1 = require("lodash");
class GeneratedSummaryAudio {
    constructor(input) {
        this._id = input._id;
        // this.summary_duration = input.summary_duration;
        this.duration = input.duration;
        this.summary_type = input.summary_type;
        this.title = input.title;
        this.language = input.language;
        this.fileId = input.fileId;
        this.model = input.model;
        this.aiResponse = input.aiResponse;
        this.summary_models = input.summary_models;
        this.audioUrl = input.audioUrl;
        this.transcriptId = input.transcriptId;
        this.transcript = input.transcript;
        this.folderId = input.folderId;
        this.summarization = input.summarization;
        // this.pii_redaction = input.pii_redaction;
        // this.content_moderation = input.content_moderation;
        // this.sentiment_nalysis = input.sentiment_nalysis;
        // this.entity_detection = input.entity_detection;
        // this.topic_detection = input.topic_detection;
        // this.auto_chapters = input.auto_chapters;
        this.keyPoints = input.keyPoints;
        this.userId = input.userId;
        // this.imageId = input.imageId;
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
exports.GeneratedSummaryAudio = GeneratedSummaryAudio;
//# sourceMappingURL=generateSummaryAudio.js.map