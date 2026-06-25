"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioModel = void 0;
const mongoose_1 = require("mongoose");
const Audio = new mongoose_1.Schema({
    title: {
        type: String,
        default: "",
    },
    audioURL: {
        type: String,
        default: "",
    },
    userId: {
        type: mongoose_1.Types.ObjectId,
        ref: "users",
        default: null,
    },
}, { timestamps: true });
exports.AudioModel = (0, mongoose_1.model)("audio", Audio);
//# sourceMappingURL=audio.js.map