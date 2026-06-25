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
const rag_1 = require("../rag");
const http_status_codes_1 = require("http-status-codes");
const generatedSummaryFromWeb_1 = require("../../modules/generatedSummaryFromWeb");
const deductCredit_1 = require("../../modules/user/deductCredit");
const history_1 = require("../../modules/history");
const folders_1 = require("../../modules/folders");
const updateWebSummary_1 = require("../../modules/generatedSummaryFromWeb/updateWebSummary");
const getSummaryFromSource_1 = require("../../modules/chatWithAI/getSummaryFromSource");
class Controller {
    constructor() {
        this.createSummarySchema = joi_1.default.object().keys({
            url: joi_1.default.string().required(),
        });
        this.updateSchema = joi_1.default.object().keys({
            summarization: joi_1.default.string().optional(),
            topic: joi_1.default.string().optional(),
            details: joi_1.default.string().optional(),
            actionPoints: joi_1.default.array().optional(),
            keyPoints: joi_1.default.array().optional(),
            tags: joi_1.default.array().optional(),
            title: joi_1.default.string().optional(),
            folderId: joi_1.default.string()
                .external(async (v) => {
                if (!v)
                    return;
                const isExist = await (0, folders_1.getFolderById)(v);
                if (!isExist)
                    throw new Error("Folder is not exists");
                return v;
            })
                .optional(),
            quotes: joi_1.default.array().optional(),
        });
        this.create = async (req, res) => {
            // Set up SSE headers
            res.setHeader("Content-Type", "text/event-stream");
            res.setHeader("Cache-Control", "no-cache");
            res.setHeader("Connection", "keep-alive");
            res.flushHeaders(); // Ensure headers are sent immediately
            // Function to send SSE events
            const sendEvent = (eventName, data) => {
                res.write(`event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`);
            };
            try {
                const authUser = req.authUser;
                // Validate input
                sendEvent("progress", { message: "Validating URL..." });
                const payloadValue = await this.createSummarySchema
                    .validateAsync(req.body)
                    .catch((e) => {
                    if ((0, joi_1.isError)(e)) {
                        throw new Error(e.message);
                    }
                    else {
                        throw new Error(e.message);
                    }
                });
                if (!payloadValue.url.startsWith("http")) {
                    throw new Error("Invalid URL. Must start with http:// or https://");
                }
                // Initialize BuildRAG
                sendEvent("progress", { message: "Fetching and analyzing web content..." });
                const rag = new rag_1.BuildRAG("web", payloadValue);
                const { docs, retrievalChain } = await rag.createChunksAndVectorStore();
                sendEvent("progress", { message: "Generating summary..." });
                const result = await retrievalChain.stream({
                    input: `Analyze the web page content and provide a comprehensive summary. Return ONLY a valid JSON object (no markdown, no code blocks, no extra text) with these exact fields:
{
  "topic": "A concise title for this content",
  "summarization": "A detailed, well-structured summary paragraph of the content",
  "keypoints": ["key point 1", "key point 2", "key point 3"],
  "actionpoints": ["action item 1", "action item 2"],
  "details": "Additional in-depth details about the content",
  "quotes": ["notable quote 1", "notable quote 2"],
  "tags": ["tag1", "tag2", "tag3"]
}
IMPORTANT: Return ONLY the JSON object. No markdown formatting, no backticks, no explanation before or after.`,
                });
                let resultString = "";
                for await (const chunk of result) {
                    resultString += (chunk === null || chunk === void 0 ? void 0 : chunk.answer) || "";
                    res.write(`event: answer\ndata: ${JSON.stringify(chunk === null || chunk === void 0 ? void 0 : chunk.answer)}\n\n`);
                }
                console.log("Web Summary Streaming Response (first 500 chars):", resultString.substring(0, 500));
                let parsed = {};
                try {
                    // Strategy 1: Try direct parse
                    parsed = JSON.parse(resultString.trim());
                }
                catch (e1) {
                    try {
                        // Strategy 2: Remove markdown code blocks and parse
                        const cleaned = resultString
                            .replace(/^```(?:json)?\s*\n?/gm, "")
                            .replace(/\n?```\s*$/gm, "")
                            .trim();
                        parsed = JSON.parse(cleaned);
                    }
                    catch (e2) {
                        try {
                            // Strategy 3: Extract JSON object using balanced brace matching
                            const startIdx = resultString.indexOf("{");
                            if (startIdx !== -1) {
                                let depth = 0;
                                let endIdx = startIdx;
                                for (let i = startIdx; i < resultString.length; i++) {
                                    if (resultString[i] === "{")
                                        depth++;
                                    else if (resultString[i] === "}") {
                                        depth--;
                                        if (depth === 0) {
                                            endIdx = i;
                                            break;
                                        }
                                    }
                                }
                                const jsonStr = resultString.substring(startIdx, endIdx + 1);
                                parsed = JSON.parse(jsonStr);
                            }
                            else {
                                throw new Error("No JSON object found in response");
                            }
                        }
                        catch (e3) {
                            console.error("All JSON parse strategies failed for Web Summary (Streaming):", e3);
                            // Final fallback: treat the entire response as a plain-text summary
                            // Clean up any JSON-like artifacts for display
                            const cleanText = resultString
                                .replace(/^```(?:json)?\s*\n?/gm, "")
                                .replace(/\n?```\s*$/gm, "")
                                .replace(/^\s*\{/, "")
                                .replace(/\}\s*$/, "")
                                .replace(/"(topic|summarization|keypoints|actionpoints|details|quotes|tags)"\s*:\s*/gi, "")
                                .trim();
                            parsed = {
                                summarization: cleanText || resultString,
                                topic: "Web Page Summary",
                                keypoints: [],
                                actionpoints: [],
                                details: "",
                                quotes: [],
                                tags: []
                            };
                        }
                    }
                }
                // Save summary
                sendEvent("progress", { message: "Saving summary..." });
                const summary = await (0, generatedSummaryFromWeb_1.saveGeneratedSummaryFromWeb)(new generatedSummaryFromWeb_1.GeneratedSummaryFromWeb({
                    url: payloadValue.url,
                    actionPoints: parsed.actionpoints || parsed.actionPoints || [],
                    details: parsed.details || "",
                    aiResponse: JSON.stringify(parsed),
                    quotes: parsed.quotes || [],
                    tags: parsed.tags || [],
                    keyPoints: parsed.keypoints || parsed.keyPoints || [],
                    summarization: parsed.summarization || parsed.summary || "",
                    userId: authUser._id,
                    topic: parsed.topic || parsed.title || "",
                }));
                // Deduct credit
                sendEvent("progress", { message: "Updating user account..." });
                await (0, deductCredit_1.deductCreditFromUserAccount)(authUser._id);
                await (0, history_1.saveHistory)(new history_1.History({
                    modelId: [summary._id],
                    modelName: history_1.getModelByName.SummaryWeb,
                    userId: authUser._id.toString(),
                }));
                // Send final metadata
                res.write(`event: metadata\ndata: ${JSON.stringify(summary)}\n\n`);
                // Close the connection
                sendEvent("done", { message: "Processing complete" });
                res.end();
            }
            catch (error) {
                console.error("Error in generate summary from web:", error);
                let errorMessage = error.message || "Something went wrong, please try again";
                let statusCode = http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR;
                if (error.isJoi) {
                    statusCode = http_status_codes_1.StatusCodes.UNPROCESSABLE_ENTITY;
                }
                if (res.headersSent) {
                    if (!res.writableEnded) {
                        sendEvent("error", { message: errorMessage, status: statusCode });
                        res.end();
                    }
                    return;
                }
                return res.status(statusCode).json({ message: errorMessage });
            }
        };
        this.createDirect = async (req, res) => {
            try {
                const authUser = req.authUser;
                // Validate input
                const payloadValue = await this.createSummarySchema.validateAsync(req.body, { stripUnknown: true });
                if (!payloadValue.url.startsWith("http")) {
                    throw new Error("Invalid URL. Must start with http:// or https://");
                }
                // Initialize BuildRAG
                const rag = new rag_1.BuildRAG("web", payloadValue);
                const { docs, retrievalChain } = await rag.createChunksAndVectorStore();
                const result = await retrievalChain.invoke({
                    input: `Analyze the web page content and provide a comprehensive summary. Return ONLY a valid JSON object (no markdown, no code blocks, no extra text) with these exact fields:
{
  "topic": "A concise title for this content",
  "summarization": "A detailed, well-structured summary paragraph of the content",
  "keypoints": ["key point 1", "key point 2", "key point 3"],
  "actionpoints": ["action item 1", "action item 2"],
  "details": "Additional in-depth details about the content",
  "quotes": ["notable quote 1", "notable quote 2"],
  "tags": ["tag1", "tag2", "tag3"]
}
IMPORTANT: Return ONLY the JSON object. No markdown formatting, no backticks, no explanation before or after.`,
                });
                const resultString = result.answer;
                console.log("Web Summary Raw Response (first 500 chars):", resultString.substring(0, 500));
                let parsed = {};
                try {
                    // Strategy 1: Try direct parse
                    parsed = JSON.parse(resultString.trim());
                }
                catch (e1) {
                    try {
                        // Strategy 2: Remove markdown code blocks and parse
                        const cleaned = resultString
                            .replace(/^```(?:json)?\s*\n?/gm, "")
                            .replace(/\n?```\s*$/gm, "")
                            .trim();
                        parsed = JSON.parse(cleaned);
                    }
                    catch (e2) {
                        try {
                            // Strategy 3: Extract JSON object using balanced brace matching
                            const startIdx = resultString.indexOf("{");
                            if (startIdx !== -1) {
                                let depth = 0;
                                let endIdx = startIdx;
                                for (let i = startIdx; i < resultString.length; i++) {
                                    if (resultString[i] === "{")
                                        depth++;
                                    else if (resultString[i] === "}") {
                                        depth--;
                                        if (depth === 0) {
                                            endIdx = i;
                                            break;
                                        }
                                    }
                                }
                                const jsonStr = resultString.substring(startIdx, endIdx + 1);
                                parsed = JSON.parse(jsonStr);
                            }
                            else {
                                throw new Error("No JSON object found in response");
                            }
                        }
                        catch (e3) {
                            console.error("All JSON parse strategies failed for Web Summary:", e3);
                            // Final fallback: treat the entire response as a plain-text summary
                            // Clean up any JSON-like artifacts for display
                            const cleanText = resultString
                                .replace(/^```(?:json)?\s*\n?/gm, "")
                                .replace(/\n?```\s*$/gm, "")
                                .replace(/^\s*\{/, "")
                                .replace(/\}\s*$/, "")
                                .replace(/"(topic|summarization|keypoints|actionpoints|details|quotes|tags)"\s*:\s*/gi, "")
                                .trim();
                            parsed = {
                                summarization: cleanText || resultString,
                                topic: "Web Page Summary",
                                keypoints: [],
                                actionpoints: [],
                                details: "",
                                quotes: [],
                                tags: []
                            };
                        }
                    }
                }
                // Save summary
                const summary = await (0, generatedSummaryFromWeb_1.saveGeneratedSummaryFromWeb)(new generatedSummaryFromWeb_1.GeneratedSummaryFromWeb({
                    url: payloadValue.url,
                    actionPoints: parsed.actionpoints || parsed.actionPoints || [],
                    details: parsed.details || "",
                    aiResponse: JSON.stringify(parsed),
                    quotes: parsed.quotes || [],
                    tags: parsed.tags || [],
                    keyPoints: parsed.keypoints || parsed.keyPoints || [],
                    summarization: parsed.summarization || parsed.summary || "",
                    userId: authUser._id,
                    topic: parsed.topic || parsed.title || "Web Page Summary",
                }));
                // Deduct credit
                await (0, deductCredit_1.deductCreditFromUserAccount)(authUser._id);
                await (0, history_1.saveHistory)(new history_1.History({
                    modelId: [summary._id],
                    modelName: history_1.getModelByName.SummaryWeb,
                    userId: authUser._id.toString(),
                }));
                return res.status(200).json({
                    result: summary,
                });
            }
            catch (error) {
                console.error("Error in generate summary from web (Direct):", error);
                let errorMessage = error.message || "Something went wrong, please try again";
                let statusCode = http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR;
                if (error.isJoi) {
                    statusCode = http_status_codes_1.StatusCodes.UNPROCESSABLE_ENTITY;
                }
                return res.status(statusCode).json({ message: errorMessage });
            }
        };
        // protected readonly create = async (req: Request, res: Response) => {
        //   try {
        //     const authUser = req.authUser;
        //     const payloadValue = await this.createSummarySchema.validateAsync(
        //       req.body,
        //       { stripUnknown: true }
        //     );
        //     if (!payloadValue) {
        //       return res.status(422).json({ message: "Invalid Payload" });
        //     }
        //     if (!payloadValue.url.startsWith("http")) {
        //       throw new Error("Invalid Url");
        //     }
        //     const rag = new BuildRAG("web", payloadValue);
        //     const { docs, retrievalChain } = await rag.createChunksAndVectorStore();
        //     res.setHeader("Content-Type", "text/event-stream");
        //     res.setHeader("Cache-Control", "no-cache");
        //     res.setHeader("Connection", "keep-alive");
        //     res.flushHeaders();
        //     const result = await retrievalChain.stream({
        //       input: `give me all the data along with summary in json object`,
        //     });
        //     let resultString = "";
        //     for await (const chunk of result) {
        //       resultString += chunk.answer || "";
        //       res.write(`event: answer\n`);
        //       res.write(`data: ${JSON.stringify(chunk?.answer)}\n\n`);
        //     }
        //     const cleanJson = resultString.replace(/```json\n?|\n```/g, "");
        //     const parsed = JSON.parse(cleanJson);
        //     const summary = await saveGeneratedSummaryFromWeb(
        //       new GeneratedSummaryFromWeb({
        //         url: payloadValue.url,
        //         actionPoints: parsed.actionPoints,
        //         details: parsed.details,
        //         aiResponse: JSON.stringify(parsed),
        //         quotes: parsed.quotes,
        //         tags: parsed.tags,
        //         keyPoints: parsed.keypoints,
        //         summary: parsed.summary,
        //         userId: authUser._id as Types.ObjectId,
        //         topic: parsed.topic,
        //       })
        //     );
        //     await deductCreditFromUserAccount(authUser._id);
        //     res.write(`event: metadata\n`);
        //     res.write(`data: ${JSON.stringify(summary)}\n\n`);
        //     res.write(`event: done\ndata: {}\n\n`);
        //     res.end();
        //   } catch (error) {
        //     console.log("error", "error in create generatedSummary", error);
        //     return res.status(500).json({
        //       message:
        //         "Something happened wrong try again generatedSummary after sometime",
        //       error: JSON.stringify(error.message),
        //     });
        //   }
        // };
        this.update = async (req, res) => {
            const authUser = req.authUser;
            const summaryId = req.params.id;
            try {
                const payloadValue = await this.updateSchema.validateAsync(req.body);
                if (!payloadValue) {
                    return res.status(422).json({ message: "Invalid payload" });
                }
                const summary = await (0, generatedSummaryFromWeb_1.checkWebSummaryIsExistById)(summaryId, authUser._id);
                if (!summary) {
                    return res
                        .status(http_status_codes_1.StatusCodes.NOT_FOUND)
                        .json({ message: "Summary not found", success: false });
                }
                const updated = await (0, updateWebSummary_1.updateWebSummary)(summaryId, payloadValue);
                return res
                    .status(http_status_codes_1.StatusCodes.OK)
                    .json({ message: "Summary updated", success: true, result: updated });
            }
            catch (error) {
                if (error.isJoi) {
                    return res.status(422).json({ message: error.message });
                }
                console.log("error", "error in update web summary", error);
                return res.status(500).json({
                    message: "Something happened wrong try again update summary after sometime",
                    error: JSON.stringify(error.message),
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
                await (0, generatedSummaryFromWeb_1.deletedSummary)(summary._id);
                return res
                    .status(http_status_codes_1.StatusCodes.OK)
                    .json({ message: "Summary Deleted", success: true });
            }
            catch (error) {
                if (error.isJoi) {
                    return res.status(422).json({ message: error.message });
                }
                console.log("error", "error in delete web summary", error);
                return res.status(500).json({
                    message: "Something happened wrong try again delete summary after sometime",
                    error: JSON.stringify(error.message),
                });
            }
        };
    }
}
exports.default = Controller;
//# sourceMappingURL=generatedSummary.controller.js.map