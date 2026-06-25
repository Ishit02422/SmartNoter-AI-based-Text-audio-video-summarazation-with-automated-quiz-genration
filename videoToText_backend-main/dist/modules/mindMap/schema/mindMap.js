"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MindMapModel = void 0;
const mongoose_1 = require("mongoose");
const SubTopicSchema = new mongoose_1.Schema({
    subTopic: {
        type: String,
        default: "",
    },
    detail: {
        type: String,
        default: "",
    },
});
const TopicSchema = new mongoose_1.Schema({
    topic: {
        type: String,
        default: "",
    },
    subtopics: [SubTopicSchema],
});
const MindMap = new mongoose_1.Schema({
    summaryId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
    },
    source: {
        type: String,
        enum: ["pdf", "audio", "video", "web", "text"],
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "users",
    },
    title: {
        type: String,
        default: "",
    },
    topics: [TopicSchema],
}, { timestamps: true });
exports.MindMapModel = (0, mongoose_1.model)("MindMap", MindMap);
//# sourceMappingURL=mindMap.js.map