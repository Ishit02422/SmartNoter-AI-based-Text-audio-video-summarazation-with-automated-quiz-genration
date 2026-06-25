"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inspirationModel = void 0;
const mongoose_1 = require("mongoose");
const inspiration = new mongoose_1.Schema({
    generatedSummaryId: {
        type: mongoose_1.Types.ObjectId,
        ref: "GeneratedSummary",
        default: null,
    },
    category: {
        type: String,
        default: "",
    },
}, { timestamps: true });
exports.inspirationModel = (0, mongoose_1.model)("inspiration", inspiration);
//# sourceMappingURL=inspiration.schema.js.map