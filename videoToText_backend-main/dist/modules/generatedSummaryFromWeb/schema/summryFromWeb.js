"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeneratedSummaryWebModel = void 0;
const mongoose_1 = require("mongoose");
const GeneratedSummaryFromWeb = new mongoose_1.Schema({
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
    details: {
        type: String,
        default: "",
    },
    folderId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "folders",
        default: null,
    },
    quotes: [
        {
            type: String,
            default: "",
        },
    ],
    tags: [
        {
            type: String,
            default: "",
        },
    ],
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
    topic: {
        type: String,
        default: "",
    },
    url: {
        type: String,
        default: "",
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
}, { timestamps: true });
exports.GeneratedSummaryWebModel = (0, mongoose_1.model)("GeneratedSummaryFromWeb", GeneratedSummaryFromWeb);
//# sourceMappingURL=summryFromWeb.js.map