"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeneratedSummaryModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const GeneratedSummaryVideo = new mongoose_1.Schema({
    sourceType: {
        type: String,
        enum: ["youtube", "upload"],
        required: true,
    },
    language: {
        type: String,
        default: "",
    },
    aiResponse: {
        type: String,
        select: false,
        default: "",
        // select: false,
    },
    summary_types: {
        type: String,
        enum: ["bullets", "bullets_verbose", "gist", "headline", "paragraph"],
    },
    summary_models: {
        type: String,
        enum: ["informative", "conversational", "catchy"],
    },
    model: {
        type: String,
        default: "summarization",
    },
    videoUrl: {
        type: String,
        default: "",
    },
    videoId: {
        type: String,
        default: "",
    },
    folderId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "folders",
        default: null,
    },
    userId: {
        type: mongoose_1.Types.ObjectId,
        ref: "users",
        default: null,
    },
    transcript: {
        type: String,
        default: "",
    },
    summarization: {
        type: String,
        default: "",
    },
    title: {
        type: String,
        default: "",
    },
}, { timestamps: true });
exports.GeneratedSummaryModel = (0, mongoose_1.model)("GeneratedSummaryVideo", GeneratedSummaryVideo);
//# sourceMappingURL=generatedSummaryVideo.js.map