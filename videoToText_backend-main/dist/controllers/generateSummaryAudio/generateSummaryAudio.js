"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Controller = void 0;
const joi_1 = __importDefault(require("joi"));
const generatedSummaryFromAudio_1 = require("../../modules/generatedSummaryFromAudio");
const rag_1 = require("../rag");
const audio_1 = require("../../modules/audio");
const http_status_codes_1 = require("http-status-codes");
const deductCredit_1 = require("../../modules/user/deductCredit");
const history_1 = require("../../modules/history");
const mongoose_1 = require("mongoose");
const getSummaryFromSource_1 = require("../../modules/chatWithAI/getSummaryFromSource");
class Controller {
    constructor() {
        this.generateSummaryAudioSchema = joi_1.default.object().keys({
            summary_type: joi_1.default.string()
                .valid("bullets", "bullets_verbose", "gist", "headline", "paragraph")
                .optional(),
            language: joi_1.default.string().optional().default("en"),
            summary_models: joi_1.default.string()
                .valid("informative", "conversational", "catchy")
                .optional(),
            model: joi_1.default.string().optional(),
            audioUrl: joi_1.default.string()
                .pattern(/^(http:\/\/|https:\/\/|audio).+/)
                .optional()
                .messages({
                "string.pattern.base": "Audio URL must start with http://, https://, or audio://",
            }),
            audioURL: joi_1.default.string().optional(),
            fileId: joi_1.default.optional().external(async (v) => {
                if (!v)
                    return;
                const file = await (0, audio_1.getAudioById)(v);
                if (!file) {
                    throw new Error("File not found");
                }
            }),
        }).or("audioUrl", "audioURL");
        this.generatedSummaryAudioEditScheam = joi_1.default.object().keys({
            aiResponse: joi_1.default.string().optional(),
            transcript: joi_1.default.string().optional(),
            summarization: joi_1.default.string().optional(),
            title: joi_1.default.string().optional(),
        });
        this.create = async (req, res) => {
            try {
                const authUser = req.authUser;
                const payloadValue = await this.generateSummaryAudioSchema
                    .validateAsync(req.body, { stripUnknown: true });
                this.payload = payloadValue;
                // If audioUrl is missing but fileId is present, fetch it from DB
                if (!this.payload.audioUrl && !this.payload.audioURL && this.payload.fileId) {
                    const file = await (0, audio_1.getAudioById)(this.payload.fileId);
                    if (file) {
                        this.payload.audioUrl = file.audioURL || file.url || file.fileUrl;
                    }
                }
                // const audioResp = await this.transcribeAndSummarize();
                // const llm = await getLlm();
                // const result = await llm.invoke(
                //   `give me summary in following language:${this.payload.language} in plain text from this audio transcript: ${audioResp.transcript}`
                // );
                // const savedData = await saveGeneratedSummary({
                //   ...this.payload,
                //   ...audioResp,
                //   summarization: result.content,
                //   userId: authUser._id,
                // });
                const rag = new rag_1.BuildRAG("audio", this.payload);
                const { docs, retrievalChain } = await rag.createChunksAndVectorStore();
                const transcriptId = docs[0].metadata.id;
                try {
                    res.setHeader("Content-Type", "text/event-stream");
                    res.setHeader("Cache-Control", "no-cache");
                    res.setHeader("Connection", "keep-alive");
                    res.flushHeaders();
                }
                catch (error) {
                    console.error("Error flushing headers:", error);
                    throw new Error("Failed to set headers for SSE");
                }
                const result = await retrievalChain.stream({
                    input: `give me transcript, summary and also give title according to summary in ${payloadValue.language} language from audio url given in context`,
                });
                let resultString = "";
                for await (const chunk of result) {
                    resultString += chunk.answer || "";
                    res.write(`event: answer\n`);
                    res.write(`data: ${JSON.stringify(chunk === null || chunk === void 0 ? void 0 : chunk.answer)}\n\n`);
                }
                let parsed = {};
                try {
                    const jsonMatch = resultString.match(/\{[\s\S]*\}/);
                    const cleanJson = jsonMatch ? jsonMatch[0] : resultString.replace(/```json\n?|\n```/g, "");
                    parsed = JSON.parse(cleanJson);
                }
                catch (e) {
                    console.error("JSON Parse Error in Audio Summary:", e);
                    parsed = {
                        summary: resultString,
                        title: "Untitled",
                        transcript: ""
                    };
                }
                const jsonResult = {
                    transcript: parsed.transcript || "",
                    summarization: parsed.summary || parsed.summarization || "",
                    title: parsed.title || "Untitled",
                    userId: authUser._id,
                    transcriptId,
                    duration: docs[0].metadata.audio_duration || 0,
                    aiResponse: resultString,
                };
                const savedData = await (0, generatedSummaryFromAudio_1.saveGeneratedSummary)(new generatedSummaryFromAudio_1.GeneratedSummaryAudio({
                    ...this.payload,
                    ...jsonResult,
                }));
                await (0, deductCredit_1.deductCreditFromUserAccount)(authUser._id);
                await (0, history_1.saveHistory)(new history_1.History({
                    modelId: [new mongoose_1.Types.ObjectId(savedData._id)],
                    modelName: history_1.getModelByName.SummaryAudio,
                    userId: authUser._id.toString(),
                }));
                res.write(`event: metadata\n`);
                res.write(`data: ${JSON.stringify(savedData)}`);
                res.write(`event: done\ndata: {}\n\n`);
                res.end();
                res.end();
            }
            catch (error) {
                if (error.isJoi) {
                    return res.status(422).json({ message: error.message });
                }
                console.log("error", "error in create generatedSummary", error);
                if (res.headersSent) {
                    if (!res.writableEnded) {
                        res.write(`event: error\n`);
                        res.write(`data: ${JSON.stringify({ message: error.message || "Streaming error" })}\n\n`);
                        res.end();
                    }
                    return;
                }
                return res.status(500).json({
                    message: "Something happened wrong try again generatedSummary after sometime",
                    error: JSON.stringify((error === null || error === void 0 ? void 0 : error.message) || error),
                });
            }
        };
        this.createDirect = async (req, res) => {
            try {
                const authUser = req.authUser;
                const payloadValue = await this.generateSummaryAudioSchema
                    .validateAsync(req.body, { stripUnknown: true });
                this.payload = payloadValue;
                // If audioUrl is missing but fileId is present, fetch it from DB
                if (!this.payload.audioUrl && !this.payload.audioURL && this.payload.fileId) {
                    const file = await (0, audio_1.getAudioById)(this.payload.fileId);
                    if (file) {
                        this.payload.audioUrl = file.audioURL || file.url || file.fileUrl;
                    }
                }
                // const audioResp = await this.transcribeAndSummarize();
                // const llm = await getLlm();
                // const result = await llm.invoke(
                //   `give me summary in following language:${this.payload.language} in plain text from this audio transcript: ${audioResp.transcript}`
                // );
                // const savedData = await saveGeneratedSummary({
                //   ...this.payload,
                //   ...audioResp,
                //   summarization: result.content,
                //   userId: authUser._id,
                // });
                const rag = new rag_1.BuildRAG("audio", this.payload);
                const { docs, retrievalChain } = await rag.createChunksAndVectorStore();
                const transcriptId = docs[0].metadata.id;
                const result = await retrievalChain.stream({
                    input: `give me transcript, summary and also give title according to summary in ${payloadValue.language} language from audio url given in context`,
                });
                let resultString = "";
                for await (const chunk of result) {
                    resultString += chunk.answer || "";
                }
                let parsed = {};
                try {
                    const jsonMatch = resultString.match(/\{[\s\S]*\}/);
                    const cleanJson = jsonMatch ? jsonMatch[0] : resultString.replace(/```json\n?|\n```/g, "");
                    parsed = JSON.parse(cleanJson);
                }
                catch (e) {
                    console.error("JSON Parse Error in Audio Summary (Direct):", e);
                    parsed = {
                        summary: resultString,
                        title: "Untitled",
                        transcript: ""
                    };
                }
                const jsonResult = {
                    transcript: parsed.transcript || "",
                    summarization: parsed.summary || parsed.summarization || "",
                    title: parsed.title || "Untitled",
                    userId: authUser._id,
                    transcriptId,
                    duration: docs[0].metadata.audio_duration || 0,
                    aiResponse: resultString,
                };
                const savedData = await (0, generatedSummaryFromAudio_1.saveGeneratedSummary)(new generatedSummaryFromAudio_1.GeneratedSummaryAudio({
                    ...this.payload,
                    ...jsonResult,
                }));
                await (0, deductCredit_1.deductCreditFromUserAccount)(authUser._id);
                await (0, history_1.saveHistory)(new history_1.History({
                    modelId: [new mongoose_1.Types.ObjectId(savedData._id)],
                    modelName: history_1.getModelByName.SummaryAudio,
                    userId: authUser._id.toString(),
                }));
                return res.status(200).json({
                    result: savedData,
                });
            }
            catch (error) {
                if (error.isJoi) {
                    return res.status(422).json({ message: error.message });
                }
                console.log("error", "error in create generatedSummary", error);
                if (res.headersSent) {
                    return;
                }
                return res.status(500).json({
                    message: "Something happened wrong try again generatedSummary after sometime",
                    error: JSON.stringify((error === null || error === void 0 ? void 0 : error.message) || error),
                });
            }
        };
        this.update = async (req, res) => {
            const authUser = req.authUser;
            const summaryId = req.params.id;
            try {
                const payloadValue = await this.generatedSummaryAudioEditScheam
                    .validateAsync(req.body)
                    .catch((e) => {
                    if (e instanceof Error) {
                        return res.status(422).json({ message: e.message });
                    }
                    return res.status(422).json({ message: "Invalid payload" });
                });
                if (!payloadValue) {
                    return res.status(422).json({ message: "Invalid payload" });
                }
                const summary = await (0, generatedSummaryFromAudio_1.checkAudioSummaryIsExistById)(summaryId, authUser._id);
                if (!summary) {
                    return res
                        .status(http_status_codes_1.StatusCodes.NOT_FOUND)
                        .json({ message: "Summary not found", success: false });
                }
                const updated = await (0, generatedSummaryFromAudio_1.updateAudioSummary)(summaryId, payloadValue);
                return res
                    .status(http_status_codes_1.StatusCodes.OK)
                    .json({ message: "Summary updated", success: true, result: updated });
            }
            catch (error) {
                console.error("Error in update generatedSummaryAudio:", error);
                return res.status(500).json({
                    message: "Something went wrong, try again later",
                    error: error instanceof Error ? error.message : "Unknown error",
                });
            }
        };
        this.delete = async (req, res) => {
            const authUser = req.authUser;
            const summaryId = req.params.id;
            const source = req.query.source;
            if (!source) {
                return res.status(400).json({ message: "Source is required" });
            }
            try {
                const summary = await (0, getSummaryFromSource_1.getSummaryFromSouceAndSummaryId)(source, summaryId, authUser._id);
                if (!summary) {
                    return res
                        .status(http_status_codes_1.StatusCodes.NOT_FOUND)
                        .json({ message: "Summary not found", success: false });
                }
                await (0, generatedSummaryFromAudio_1.deletedSummary)(summary._id);
                return res
                    .status(http_status_codes_1.StatusCodes.OK)
                    .json({ message: "Summary Deleted", success: true });
            }
            catch (error) {
                if (error.isJoi) {
                    return res.status(422).json({ message: error.message });
                }
                console.log("error", "error in delete audio summary", error);
                return res.status(500).json({
                    message: "Something happened wrong try again delete summary after sometime",
                    error: JSON.stringify(error.message),
                });
            }
        };
    }
}
exports.Controller = Controller;
//# sourceMappingURL=generateSummaryAudio.js.map