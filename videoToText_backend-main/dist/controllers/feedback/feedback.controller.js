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
const joi_1 = __importStar(require("joi"));
const feedback_1 = require("../../modules/feedback");
const user_1 = require("../../modules/user");
class Controller {
    constructor() {
        this.feedbackCreateSchema = joi_1.default.object().keys({
            appVersion: joi_1.default.string().optional().allow(""),
            deviceName: joi_1.default.string().optional().allow(""),
            deviceVersion: joi_1.default.string().optional().allow(""),
            deviceId: joi_1.default.string().optional().allow(""),
            location: joi_1.default.string().optional().allow(""),
            option1: joi_1.default.string().optional().allow(""),
            option2: joi_1.default.string().optional().allow(""),
            option3: joi_1.default.string().optional().allow(""),
            option4: joi_1.default.string().optional().allow(""),
            comment: joi_1.default.string().optional().allow(""),
            buildNumber: joi_1.default.string().optional().allow(""),
        });
        this.create = async (req, res) => {
            try {
                const authUser = req.authUser;
                const payloadValue = await this.feedbackCreateSchema
                    .validateAsync(req.body)
                    .then((value) => {
                    return value;
                })
                    .catch((e) => {
                    if ((0, joi_1.isError)(e)) {
                        res.status(422).json(e);
                    }
                    else {
                        res.status(422).json({ message: e.message });
                    }
                });
                if (!payloadValue) {
                    return;
                }
                const existFeedback = await (0, feedback_1.getFeedbackByUserId)(authUser._id.toString());
                if (existFeedback) {
                    const updatedFeedback = await (0, feedback_1.updateFeedback)(new feedback_1.Feedback({
                        ...existFeedback,
                        ...payloadValue,
                        email: authUser.email,
                        userId: authUser._id,
                    }));
                    return res.status(200).json(updatedFeedback);
                }
                else {
                    const feedback = await (0, feedback_1.saveFeedback)(new feedback_1.Feedback({
                        ...payloadValue,
                        email: authUser.email,
                        deviceId: authUser.deviceId,
                        userId: authUser._id,
                    }));
                    const toBeUpdatedAccount = new user_1.User({
                        ...authUser,
                        feedBackGiven: true,
                    });
                    await (0, user_1.updateUser)(toBeUpdatedAccount);
                    return res.status(200).json(feedback);
                }
            }
            catch (error) {
                console.log("error", "error in create feedback", error);
                return res.status(500).json({
                    message: "Something happened wrong try again feedback after sometime",
                    error: JSON.stringify(error),
                });
            }
        };
    }
}
exports.default = Controller;
//# sourceMappingURL=feedback.controller.js.map