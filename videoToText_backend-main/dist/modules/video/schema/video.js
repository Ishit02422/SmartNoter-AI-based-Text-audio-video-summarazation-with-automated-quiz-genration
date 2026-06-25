"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoModel = void 0;
const mongoose_1 = require("mongoose");
const Video = new mongoose_1.Schema({
    title: {
        type: String,
        default: "",
    },
    videoURL: {
        type: String,
        default: "",
    },
    userId: {
        type: mongoose_1.Types.ObjectId,
        ref: "users",
        default: null,
    },
}, { timestamps: true });
exports.VideoModel = (0, mongoose_1.model)("Video", Video);
//# sourceMappingURL=video.js.map