"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfModel = void 0;
const mongoose_1 = require("mongoose");
const PDF = new mongoose_1.Schema({
    title: {
        type: String,
        default: "",
    },
    pdfURL: {
        type: String,
        default: "",
    },
    userId: {
        type: mongoose_1.Types.ObjectId,
        ref: "users",
        default: null,
    },
}, { timestamps: true });
exports.PdfModel = (0, mongoose_1.model)("pdf", PDF);
//# sourceMappingURL=pdf.js.map