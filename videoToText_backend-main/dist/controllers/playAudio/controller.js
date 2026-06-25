"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const gtts_1 = __importDefault(require("gtts"));
const joi_1 = __importDefault(require("joi"));
const getSummaryFromSource_1 = require("../../modules/chatWithAI/getSummaryFromSource");
const http_status_codes_1 = require("http-status-codes");
const getTranslatedSummary_1 = require("../../modules/translate/getTranslatedSummary");
class Controller {
    constructor() {
        this.generateAudioSchema = joi_1.default.object().keys({
            source: joi_1.default.string()
                .valid("pdf", "video", "audio", "web", "text")
                .required(),
            summaryId: joi_1.default.string().required(),
        });
        this.create = async (req, res) => {
            try {
                const authUser = req.authUser;
                const payloadValue = await this.generateAudioSchema.validateAsync(req.body, {
                    stripUnknown: true,
                });
                const summary = await (0, getSummaryFromSource_1.getSummaryFromSouceAndSummaryId)(payloadValue.source, payloadValue.summaryId, authUser._id);
                if (!summary) {
                    return res
                        .status(http_status_codes_1.StatusCodes.NOT_FOUND)
                        .json({ message: "Summary not found", success: false });
                }
                const text = summary.summarization || (summary === null || summary === void 0 ? void 0 : summary.summary);
                const fileName = `${(0, uuid_1.v4)()}.mp3`;
                const filePath = path_1.default.join(__dirname, "audios", fileName);
                const gtts = new gtts_1.default(text, "en");
                // Create audios folder if not exists
                if (!fs_1.default.existsSync(path_1.default.join(__dirname, "audios"))) {
                    fs_1.default.mkdirSync(path_1.default.join(__dirname, "audios"));
                }
                gtts.save(filePath, (err) => {
                    if (err) {
                        return res.status(500).json({ error: "TTS failed" });
                    }
                    res.sendFile(filePath, (err) => {
                        if (!err) {
                            // Optional: delete the file after sending it
                            setTimeout(() => fs_1.default.unlinkSync(filePath), 10000); // delete after 10s
                        }
                    });
                });
            }
            catch (error) {
                if (error.isJoi) {
                    return res.status(422).json({ message: error.message });
                }
                console.log("error", "error in generate summary audio", error);
                return res.status(500).json({
                    message: "Something happened wrong try again audio summary after sometime",
                    error: JSON.stringify(error.message),
                });
            }
        };
        this.generateTranslatedSummaryAudioSchema = joi_1.default.object().keys({
            source: joi_1.default.string()
                .valid("pdf", "video", "audio", "web", "text")
                .required(),
            summaryId: joi_1.default.string().required(),
            language: joi_1.default.string().custom((value, helpers) => {
                if (typeof value !== "string")
                    return value;
                return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
            }),
        });
        this.createAudioForTranslatedSummary = async (req, res) => {
            try {
                const authUser = req.authUser;
                const payloadValue = await this.generateTranslatedSummaryAudioSchema.validateAsync(req.body, {
                    stripUnknown: true,
                });
                const summary = await (0, getSummaryFromSource_1.getSummaryFromSouceAndSummaryId)(payloadValue.source, payloadValue.summaryId, authUser._id);
                if (!summary) {
                    return res
                        .status(http_status_codes_1.StatusCodes.NOT_FOUND)
                        .json({ message: "Summary not found", success: false });
                }
                const translatedSummary = await (0, getTranslatedSummary_1.getTranslatedSummary)(summary._id, payloadValue.source, payloadValue.language, authUser._id);
                if (!translatedSummary) {
                    return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({
                        message: "First Translate Summary in Specific Language then Generate Audio",
                        success: false,
                    });
                }
                const text = translatedSummary.translatedSummary;
                const fileName = `${(0, uuid_1.v4)()}.mp3`;
                const filePath = path_1.default.join(__dirname, "audios", fileName);
                const gtts = new gtts_1.default(text, "en");
                // Create audios folder if not exists
                if (!fs_1.default.existsSync(path_1.default.join(__dirname, "audios"))) {
                    fs_1.default.mkdirSync(path_1.default.join(__dirname, "audios"));
                }
                gtts.save(filePath, (err) => {
                    if (err) {
                        return res.status(500).json({ error: "TTS failed" });
                    }
                    res.sendFile(filePath, (err) => {
                        if (!err) {
                            // Optional: delete the file after sending it
                            setTimeout(() => fs_1.default.unlinkSync(filePath), 10000); // delete after 10s
                        }
                    });
                });
            }
            catch (error) {
                if (error.isJoi) {
                    return res.status(422).json({ message: error.message });
                }
                console.log("error", "error in generate translated summary audio", error);
                return res.status(500).json({
                    message: "Something happened wrong try again generate translated summary audio after sometime",
                    error: JSON.stringify(error.message),
                });
            }
        };
    }
}
exports.default = Controller;
//# sourceMappingURL=controller.js.map