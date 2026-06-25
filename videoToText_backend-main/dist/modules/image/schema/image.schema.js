"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageModel = void 0;
const mongoose_1 = require("mongoose");
const image = new mongoose_1.Schema({
    description: {
        type: String,
        default: "",
    },
    title: {
        type: String,
        default: "",
    },
    imageURL: {
        type: String,
        default: "",
    },
    thumbnail: {
        type: String,
        default: "",
    },
    userId: {
        type: mongoose_1.Types.ObjectId,
        ref: "users",
        default: null,
    },
}, { timestamps: true });
exports.ImageModel = (0, mongoose_1.model)("image", image);
//# sourceMappingURL=image.schema.js.map