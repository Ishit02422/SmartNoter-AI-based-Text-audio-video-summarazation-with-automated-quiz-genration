"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedbackModel = void 0;
const mongoose_1 = require("mongoose");
const feedback = new mongoose_1.Schema({
    email: {
        type: String,
        default: "",
    },
    deviceId: {
        type: String,
        default: "",
    },
    appVersion: {
        type: String,
        default: "",
    },
    deviceName: {
        type: String,
        default: "",
    },
    deviceVersion: {
        type: String,
        default: "",
    },
    location: {
        type: String,
        default: "",
    },
    option1: {
        type: String,
        default: "",
    },
    option2: {
        type: String,
        default: "",
    },
    option3: {
        type: String,
        default: "",
    },
    option4: {
        type: String,
        default: "",
    },
    comment: {
        type: String,
        default: "",
    },
    buildNumber: {
        type: String,
        default: "",
    },
    // feedback: [
    //   {
    //     question: {
    //       type: String,
    //       default: "",
    //     },
    //     answer: {
    //       type: String,
    //       default: "",
    //     },
    //   },
    // ],
    userId: {
        type: mongoose_1.Types.ObjectId,
        ref: "users",
        default: "",
    },
}, { timestamps: true });
exports.FeedbackModel = (0, mongoose_1.model)("feedback", feedback);
//# sourceMappingURL=feedback.schema.js.map