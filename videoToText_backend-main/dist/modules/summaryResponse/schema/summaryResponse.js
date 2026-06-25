"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SummaryResponseModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const SummaryResponse = new mongoose_1.default.Schema({
    response: {
        type: String,
        default: "",
    },
    source: {
        type: String,
        enum: ["video", "audio", "pdf", "web", "text"],
        default: "",
    },
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "users",
        default: null,
    },
}, { timestamps: true });
exports.SummaryResponseModel = mongoose_1.default.model("SummaryResponse", SummaryResponse);
//# sourceMappingURL=summaryResponse.js.map