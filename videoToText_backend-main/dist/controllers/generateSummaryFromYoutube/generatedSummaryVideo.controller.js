"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const dotenv_1 = require("dotenv");
const generateSummaryFromYoutube_1 = require("../../modules/generateSummaryFromYoutube");
const rag_1 = require("../rag");
const http_status_codes_1 = require("http-status-codes");
const user_1 = require("../../modules/user");
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const video_1 = require("../../modules/video");
const history_1 = require("../../modules/history");
const mongoose_1 = require("mongoose");
const ffmpeg_1 = __importDefault(require("@ffmpeg-installer/ffmpeg"));
const getSummaryFromSource_1 = require("../../modules/chatWithAI/getSummaryFromSource");
(0, dotenv_1.config)();
fluent_ffmpeg_1.default.setFfmpegPath(ffmpeg_1.default.path);
class Controller {
    constructor() {
        this.generatedSummaryVideoCreateSchema = joi_1.default.object().keys({
            videoUrl: joi_1.default.string()
                .pattern(/^(https?:\/\/)?([a-zA-Z0-9-]+\.)?(youtube\.com|youtu\.be)\/.+$/)
                .required()
                .messages({
                "string.pattern.base": "Video URL must be a valid YouTube link.",
                "string.empty": "Video URL is required.",
            }),
            model: joi_1.default.string().optional(),
            summary_models: joi_1.default.string()
                .valid("informative", "conversational", "catchy")
                .optional(),
            // folderId: Joi.string().external(async (v: string) => {
            //   let id;
            //   if (v) {
            //     id = await getFolderById(v, this.authUser._id);
            //   } else {
            //     id = await checkFolderExistsWithUserId(
            //       this.authUser._id,
            //       "All Notes"
            //     );
            //   }
            //   return id;
            // }),
            summary_types: joi_1.default.string()
                .valid("bullets", "bullets_verbose", "gist", "headline", "paragraph")
                .optional(),
            language: joi_1.default.string()
                .pattern(/^[a-z]{2}$/i)
                .optional()
                .default("en")
                .label("Language Code"),
        });
        this.generatedSummaryVideoEditScheam = joi_1.default.object().keys({
            aiResponse: joi_1.default.string().optional(),
            transcript: joi_1.default.string().optional(),
            summarization: joi_1.default.string().optional(),
            language: joi_1.default.string().optional(),
            title: joi_1.default.string().optional(),
        });
        this.generatedSummaryUploadedVideoCreateSchema = joi_1.default.object().keys({
            videoUrl: joi_1.default.string()
                // .custom((v: string) => {
                //   if (!v) return;
                //   if (!v.startsWith("video")) throw new Error("Invalid Video Url");
                //   return `${process.env.BASE_URL}/${v}`;
                // })
                .required(),
            fileId: joi_1.default.string()
                .external(async (v) => {
                if (!v)
                    return;
                const file = await (0, video_1.getVideoById)(v);
                if (!file) {
                    throw new Error("Video not found");
                }
            })
                .required(),
            language: joi_1.default.string().optional().default("English"),
        });
        this.create = async (req, res) => {
            var _a, _b, _c, _d;
            try {
                const authUser = req.authUser;
                this.authUser = authUser;
                const payloadValue = await this.generatedSummaryVideoCreateSchema.validateAsync(req.body, {
                    stripUnknown: true,
                });
                const videoId = await this.extractVideoIdFromLink(payloadValue.videoUrl);
                if (!videoId) {
                    return res.status(400).json({
                        message: "Invalid or missing YouTube video ID",
                        success: false,
                    });
                }
                const rag = new rag_1.BuildRAG("youtube", payloadValue);
                const { docs, retrievalChain } = await rag.createChunksAndVectorStore();
                const result = await retrievalChain.stream({
                    input: `give me transcript and summary in ${payloadValue.language} language from youtube video url given in context`,
                });
                res.setHeader("Content-Type", "text/event-stream");
                res.setHeader("Cache-Control", "no-cache");
                res.setHeader("Connection", "keep-alive");
                res.flushHeaders();
                let resultString = "";
                for await (const chunk of result) {
                    resultString += (chunk === null || chunk === void 0 ? void 0 : chunk.answer) || "";
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
                    console.error("JSON Parse Error in Video Summary:", e);
                    // Fallback for non-JSON responses
                    parsed = {
                        summary: resultString,
                        title: ((_b = (_a = docs === null || docs === void 0 ? void 0 : docs[0]) === null || _a === void 0 ? void 0 : _a.metadata) === null || _b === void 0 ? void 0 : _b.title) || "Untitled",
                        transcript: "Transcript failed to parse or available in raw text",
                    };
                }
                const restData = {
                    title: (parsed === null || parsed === void 0 ? void 0 : parsed.topic) || (parsed === null || parsed === void 0 ? void 0 : parsed.title) || ((_d = (_c = docs[0]) === null || _c === void 0 ? void 0 : _c.metadata) === null || _d === void 0 ? void 0 : _d.title) || "Untitled",
                    videoId,
                    summarization: (parsed === null || parsed === void 0 ? void 0 : parsed.summarization) || (parsed === null || parsed === void 0 ? void 0 : parsed.summary) || "Summary could not be generated",
                    transcript: (parsed === null || parsed === void 0 ? void 0 : parsed.transcript) || ((docs === null || docs === void 0 ? void 0 : docs[0]) ? docs[0].pageContent : "Transcript not available"),
                    userId: authUser._id,
                    language: payloadValue.language,
                    sourceType: "youtube",
                };
                //store data in db
                const savedData = await (0, generateSummaryFromYoutube_1.saveGeneratedSummaryFromYoutube)(new generateSummaryFromYoutube_1.GeneratedSummaryVideo({
                    ...payloadValue,
                    ...restData,
                    aiResponse: JSON.stringify(parsed),
                }));
                const { aiResponse, ...dbData } = savedData;
                //send response in streams
                await (0, user_1.deductCreditAndAddReward)(authUser._id, "VIDEO_SUMMARY");
                await (0, history_1.saveHistory)(new history_1.History({
                    modelId: [new mongoose_1.Types.ObjectId(savedData._id)],
                    modelName: history_1.getModelByName.SummaryVideo,
                    userId: authUser._id.toString(),
                }));
                res.write(`event: metadata\n`);
                res.write(`data: ${JSON.stringify({
                    dbData,
                })}\n\n`);
                // Final signal to close
                res.write(`event: done\ndata: {}\n\n`);
                res.end();
                // return res.status(200).json({
                //   videoId,
                //   result,
                //   metadata: docs?.[0]?.metadata,
                //   language: payloadValue.language || "en",
                // });
            }
            catch (error) {
                if (error.isJoi) {
                    if (res.headersSent) {
                        if (!res.writableEnded) {
                            res.write(`event: error\n`);
                            res.write(`data: ${JSON.stringify({ message: error.message })}\n\n`);
                            res.end();
                        }
                        return;
                    }
                    return res.status(422).json({ message: error.message });
                }
                console.error("FULL ERROR IN CREATE:", error);
                if (res.headersSent) {
                    if (!res.writableEnded) {
                        res.write(`event: error\n`);
                        res.write(`data: ${JSON.stringify({ message: error.message || "Streaming error" })}\n\n`);
                        res.end();
                    }
                    return;
                }
                return res.status(500).json({
                    message: error.message || "Failed to generate summary",
                    error: error.stack || error.message || "Unknown error",
                });
            }
        };
        this.createDirect = async (req, res) => {
            var _a, _b, _c, _d;
            try {
                const authUser = req.authUser;
                this.authUser = authUser;
                const payloadValue = await this.generatedSummaryVideoCreateSchema.validateAsync(req.body, {
                    stripUnknown: true,
                });
                const videoId = await this.extractVideoIdFromLink(payloadValue.videoUrl);
                if (!videoId) {
                    return res.status(400).json({
                        message: "Invalid or missing YouTube video ID",
                        success: false,
                    });
                }
                const rag = new rag_1.BuildRAG("youtube", payloadValue);
                const { docs, retrievalChain } = await rag.createChunksAndVectorStore();
                const result = await retrievalChain.stream({
                    input: `give me transcript and summary in ${payloadValue.language} language from youtube video url given in context`,
                });
                let resultString = "";
                for await (const chunk of result) {
                    console.log(chunk.answer);
                    resultString += (chunk === null || chunk === void 0 ? void 0 : chunk.answer) || "";
                }
                let parsed = {};
                try {
                    const jsonMatch = resultString.match(/\{[\s\S]*\}/);
                    const cleanJson = jsonMatch ? jsonMatch[0] : resultString.replace(/```json\n?|\n```/g, "");
                    parsed = JSON.parse(cleanJson);
                }
                catch (e) {
                    console.error("JSON parse failed in createDirect:", e);
                    // Fallback or handle error
                    parsed = {
                        summary: resultString,
                        title: ((_b = (_a = docs === null || docs === void 0 ? void 0 : docs[0]) === null || _a === void 0 ? void 0 : _a.metadata) === null || _b === void 0 ? void 0 : _b.title) || "Untitled",
                        transcript: "Transcript failed to parse or available in raw text",
                    };
                }
                const restData = {
                    title: (parsed === null || parsed === void 0 ? void 0 : parsed.topic) || (parsed === null || parsed === void 0 ? void 0 : parsed.title) || ((_d = (_c = docs[0]) === null || _c === void 0 ? void 0 : _c.metadata) === null || _d === void 0 ? void 0 : _d.title) || "Untitled",
                    videoId,
                    summarization: (parsed === null || parsed === void 0 ? void 0 : parsed.summarization) || (parsed === null || parsed === void 0 ? void 0 : parsed.summary) || "Summary could not be generated",
                    transcript: (parsed === null || parsed === void 0 ? void 0 : parsed.transcript) || ((docs === null || docs === void 0 ? void 0 : docs[0]) ? docs[0].pageContent : "Transcript not available"),
                    userId: authUser._id,
                    language: payloadValue.language,
                    sourceType: "youtube",
                };
                //store data in db
                const savedData = await (0, generateSummaryFromYoutube_1.saveGeneratedSummaryFromYoutube)(new generateSummaryFromYoutube_1.GeneratedSummaryVideo({
                    ...payloadValue,
                    ...restData,
                    aiResponse: JSON.stringify(parsed),
                }));
                //send response in streams
                await (0, user_1.deductCreditAndAddReward)(authUser._id, "VIDEO_SUMMARY");
                await (0, history_1.saveHistory)(new history_1.History({
                    modelId: [new mongoose_1.Types.ObjectId(savedData._id)],
                    modelName: history_1.getModelByName.SummaryVideo,
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
                console.error("FULL ERROR IN CREATE DIRECT:", error);
                const statusCode = error.message.includes("credits") ? 402 : 500;
                return res.status(statusCode).json({
                    message: error.message || "Failed to generate summary",
                    error: error.stack || error.message || "Unknown internal error",
                    success: false
                });
            }
        };
        this.update = async (req, res) => {
            const authUser = req.authUser;
            const summaryId = req.params.id;
            try {
                const payloadValue = await this.generatedSummaryVideoEditScheam
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
                const summary = await (0, generateSummaryFromYoutube_1.checkVideoSummaryIsExistById)(summaryId, authUser._id);
                if (!summary) {
                    return res
                        .status(http_status_codes_1.StatusCodes.NOT_FOUND)
                        .json({ message: "Summary not found", success: false });
                }
                const updated = await (0, generateSummaryFromYoutube_1.updateVideoSummary)(summaryId, payloadValue);
                return res
                    .status(http_status_codes_1.StatusCodes.OK)
                    .json({ message: "Summary updated", success: true, result: updated });
            }
            catch (error) {
                console.error("Error in update generatedSummaryVideo:", error);
                return res.status(500).json({
                    message: "Something went wrong, try again later",
                    error: error instanceof Error ? error.message : "Unknown error",
                });
            }
        };
        this.downloadVideo = async (url) => {
            const fileName = `video-${(0, uuid_1.v4)()}.mkv`;
            const videopath = path_1.default.join(__dirname, fileName);
            const response = await (0, axios_1.default)({
                url,
                method: "GET",
                responseType: "stream",
            });
            const writer = fs_1.default.createWriteStream(videopath);
            return new Promise((resolve, reject) => {
                response.data.pipe(writer);
                writer.on("finish", () => resolve(videopath));
                writer.on("error", () => {
                    fs_1.default.unlink(videopath, (err) => {
                        if (err)
                            throw new Error(err.message);
                    });
                    reject;
                });
            });
        };
        this.extractAudio = async (videoPath, audioPath) => new Promise((resolve, reject) => {
            (0, fluent_ffmpeg_1.default)(videoPath)
                .noVideo()
                .audioCodec("libmp3lame")
                .save(audioPath)
                .on("end", resolve)
                .on("error", reject);
        });
        this.uploadedVideo = async (req, res) => {
            let videopath;
            let audiopath;
            try {
                const authUser = req.authUser;
                this.authUser = authUser;
                const payloadValue = await this.generatedSummaryUploadedVideoCreateSchema.validateAsync(req.body, {
                    stripUnknown: true,
                });
                videopath = await this.downloadVideo(`${process.env.BASE_URL}/${payloadValue.videoUrl}`);
                const fileName = `audio-${(0, uuid_1.v4)()}.wav`;
                audiopath = path_1.default.join(__dirname, fileName);
                await this.extractAudio(videopath, audiopath);
                const rag = new rag_1.BuildRAG("uploadvideo", { audioUrl: audiopath });
                const { docs, retrievalChain } = await rag.createChunksAndVectorStore();
                const result = await retrievalChain.stream({
                    input: `give me transcript, summary and title in ${payloadValue.language} language from youtube video url given in context`,
                });
                let resultString = "";
                res.setHeader("Content-Type", "text/event-stream");
                res.setHeader("Cache-Control", "no-cache");
                res.setHeader("Connection", "keep-alive");
                res.flushHeaders();
                for await (const chunk of result) {
                    resultString += (chunk === null || chunk === void 0 ? void 0 : chunk.answer) || "";
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
                    console.error("JSON parse failed in uploadedVideo:", e);
                    parsed = {
                        summary: resultString,
                        title: "Untitled",
                        transcript: "Transcript failed to parse or available in raw text",
                    };
                }
                const restData = {
                    title: (parsed === null || parsed === void 0 ? void 0 : parsed.topic) || (parsed === null || parsed === void 0 ? void 0 : parsed.title) || "Untitled",
                    summarization: (parsed === null || parsed === void 0 ? void 0 : parsed.summarization) || (parsed === null || parsed === void 0 ? void 0 : parsed.summary) || "Summary could not be generated",
                    transcript: (parsed === null || parsed === void 0 ? void 0 : parsed.transcript) || ((docs === null || docs === void 0 ? void 0 : docs[0]) ? docs[0].pageContent : "Transcript not available"),
                    userId: authUser._id,
                    videoId: "",
                    aiResponse: JSON.stringify(parsed),
                    sourceType: "upload",
                    language: payloadValue.language || "English",
                };
                // //store data in db
                const savedData = await (0, generateSummaryFromYoutube_1.saveGeneratedSummaryFromYoutube)(new generateSummaryFromYoutube_1.GeneratedSummaryVideo({
                    ...payloadValue,
                    ...restData,
                }));
                await (0, user_1.deductCreditAndAddReward)(authUser._id, "VIDEO_SUMMARY");
                // //send response in streams
                res.write(`event: metadata\n`);
                res.write(`data: ${JSON.stringify({
                    resultData: savedData,
                })}\n\n`);
                // // Final signal to close
                res.write(`event: done\ndata: {}\n\n`);
                res.end();
            }
            catch (error) {
                if (error.isJoi) {
                    if (res.headersSent) {
                        if (!res.writableEnded) {
                            res.write(`event: error\n`);
                            res.write(`data: ${JSON.stringify({ message: error.message })}\n\n`);
                            res.end();
                        }
                        return;
                    }
                    return res.status(422).json({ message: error.message });
                }
                console.log("error", "error in generate upload video summary", error);
                if (res.headersSent) {
                    if (!res.writableEnded) {
                        res.write(`event: error\n`);
                        res.write(`data: ${JSON.stringify({ message: error.message || "Streaming error" })}\n\n`);
                        res.end();
                    }
                    return;
                }
                return res.status(500).json({
                    message: "Something happened wrong try again generate summary after sometime",
                    error: JSON.stringify(error.message),
                });
            }
            finally {
                fs_1.default.unlink(videopath, (err) => {
                    if (err)
                        return new Error(err.message);
                    return;
                });
                fs_1.default.unlink(audiopath, (err) => {
                    if (err)
                        return new Error(err.message);
                    return;
                });
            }
        };
        this.uploadedVideoDirect = async (req, res) => {
            let videopath;
            let audiopath;
            try {
                const authUser = req.authUser;
                this.authUser = authUser;
                const payloadValue = await this.generatedSummaryUploadedVideoCreateSchema.validateAsync(req.body, {
                    stripUnknown: true,
                });
                videopath = await this.downloadVideo(`${process.env.BASE_URL}/${payloadValue.videoUrl}`);
                const fileName = `audio-${(0, uuid_1.v4)()}.wav`;
                audiopath = path_1.default.join(__dirname, fileName);
                await this.extractAudio(videopath, audiopath);
                const rag = new rag_1.BuildRAG("uploadvideo", { audioUrl: audiopath });
                const { docs, retrievalChain } = await rag.createChunksAndVectorStore();
                const result = await retrievalChain.stream({
                    input: `give me transcript, summary and title in ${payloadValue.language} language from youtube video url given in context`,
                });
                let resultString = "";
                for await (const chunk of result) {
                    resultString += (chunk === null || chunk === void 0 ? void 0 : chunk.answer) || "";
                }
                let parsed = {};
                try {
                    const jsonMatch = resultString.match(/\{[\s\S]*\}/);
                    const cleanJson = jsonMatch ? jsonMatch[0] : resultString.replace(/```json\n?|\n```/g, "");
                    parsed = JSON.parse(cleanJson);
                }
                catch (e) {
                    console.error("JSON parse failed in uploadedVideoDirect:", e);
                    parsed = {
                        summary: resultString,
                        title: "Untitled",
                        transcript: "Transcript failed to parse or available in raw text",
                    };
                }
                const restData = {
                    title: (parsed === null || parsed === void 0 ? void 0 : parsed.topic) || (parsed === null || parsed === void 0 ? void 0 : parsed.title) || "Untitled",
                    summarization: (parsed === null || parsed === void 0 ? void 0 : parsed.summarization) || (parsed === null || parsed === void 0 ? void 0 : parsed.summary) || "Summary could not be generated",
                    transcript: (parsed === null || parsed === void 0 ? void 0 : parsed.transcript) || ((docs === null || docs === void 0 ? void 0 : docs[0]) ? docs[0].pageContent : "Transcript not available"),
                    userId: authUser._id,
                    videoId: "",
                    aiResponse: JSON.stringify(parsed),
                    sourceType: "upload",
                    language: payloadValue.language || "English",
                };
                // //store data in db
                const savedData = await (0, generateSummaryFromYoutube_1.saveGeneratedSummaryFromYoutube)(new generateSummaryFromYoutube_1.GeneratedSummaryVideo({
                    ...payloadValue,
                    ...restData,
                }));
                await (0, user_1.deductCreditAndAddReward)(authUser._id, "VIDEO_SUMMARY");
                // //send response in streams
                return res.status(http_status_codes_1.StatusCodes.OK).json({ result: savedData });
            }
            catch (error) {
                if (error.isJoi) {
                    return res.status(422).json({ message: error.message });
                }
                console.log("error", "error in generate upload video summary", error);
                return res.status(500).json({
                    message: "Something happened wrong try again generate summary after sometime",
                    error: JSON.stringify(error.message),
                });
            }
            finally {
                if (videopath) {
                    fs_1.default.unlink(videopath, (err) => {
                        if (err)
                            console.error("Error unlinking videopath:", err.message);
                    });
                }
                if (audiopath) {
                    fs_1.default.unlink(audiopath, (err) => {
                        if (err)
                            console.error("Error unlinking audiopath:", err.message);
                    });
                }
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
                await (0, generateSummaryFromYoutube_1.deletedSummary)(summary._id);
                return res
                    .status(http_status_codes_1.StatusCodes.OK)
                    .json({ message: "Summary Deleted", success: true });
            }
            catch (error) {
                if (error.isJoi) {
                    return res.status(422).json({ message: error.message });
                }
                console.log("error", "error in delete video summary", error);
                return res.status(500).json({
                    message: "Something happened wrong try again delete summary after sometime",
                    error: JSON.stringify(error.message),
                });
            }
        };
    }
    // Extract video ID from YouTube URL
    async extractVideoIdFromLink(url) {
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    }
}
exports.default = Controller;
//# sourceMappingURL=generatedSummaryVideo.controller.js.map