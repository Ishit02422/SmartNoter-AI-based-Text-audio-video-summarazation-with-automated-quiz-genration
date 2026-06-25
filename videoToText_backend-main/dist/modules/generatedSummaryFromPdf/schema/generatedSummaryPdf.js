"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateSummyPdfModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const GenerateSummaryPDF = new mongoose_1.default.Schema({
    keyPoints: [
        {
            type: String,
            default: "",
        },
    ],
    actionPoints: [
        {
            type: String,
            default: "",
        },
    ],
    language: {
        type: String,
        default: "en",
    },
    aiResponse: {
        type: String,
        default: "",
        select: false,
    },
    pdfUrl: {
        type: String,
        default: "",
    },
    fileId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "pdfs",
        default: null,
    },
    folderId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "folders",
        default: null,
    },
    summarization: {
        type: String,
        default: "",
    },
    summary_type: {
        type: String,
        default: "bullets",
    },
    title: {
        type: String,
        default: "",
    },
    transcript: {
        type: String,
        default: "",
    },
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "users",
        default: null,
    },
}, { timestamps: true });
exports.GenerateSummyPdfModel = mongoose_1.default.model("GenerateSummaryPDF", GenerateSummaryPDF);
//# sourceMappingURL=generatedSummaryPdf.js.map