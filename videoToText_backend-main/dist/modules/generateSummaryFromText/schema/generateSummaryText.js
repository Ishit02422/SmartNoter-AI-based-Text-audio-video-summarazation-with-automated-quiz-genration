"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeneratedSummaryTextModel = void 0;
const mongoose_1 = require("mongoose");
const GeneratedSummaryFromText = new mongoose_1.Schema({
    actionPoints: [
        {
            type: String,
            default: "",
        },
    ],
    aiResponse: {
        type: String,
        default: "",
        select: false,
    },
    folderId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "folders",
        default: null,
    },
    keyPoints: [
        {
            type: String,
            default: "",
        },
    ],
    summarization: {
        type: String,
        default: "",
    },
    title: {
        type: String,
        default: "",
    },
    text: {
        type: String,
        default: "",
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
}, { timestamps: true });
exports.GeneratedSummaryTextModel = (0, mongoose_1.model)("GeneratedSummaryFromText", GeneratedSummaryFromText);
//# sourceMappingURL=generateSummaryText.js.map