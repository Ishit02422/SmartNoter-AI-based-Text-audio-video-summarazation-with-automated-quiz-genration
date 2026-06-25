"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Controller = void 0;
const joi_1 = __importDefault(require("joi"));
const http_status_codes_1 = require("http-status-codes");
const deductCredit_1 = require("../../modules/user/deductCredit");
const history_1 = require("../../modules/history");
const llm_1 = require("../../llm");
const prompts_1 = require("@langchain/core/prompts");
const generateSummaryFromText_1 = require("../../modules/generateSummaryFromText");
const getSummaryFromSource_1 = require("../../modules/chatWithAI/getSummaryFromSource");
class Controller {
    constructor() {
        this.generateSummaryTextSchema = joi_1.default.object().keys({
            language: joi_1.default.string().optional().default("en"),
            text: joi_1.default.string()
                .required()
                .replace(/['"]/g, ""),
        });
        this.generatedSummaryTextEditScheam = joi_1.default.object().keys({
            actionPoints: joi_1.default.array().optional(),
            keyPoints: joi_1.default.array().optional(),
            summarization: joi_1.default.string().optional(),
            title: joi_1.default.string().optional(),
        });
        this.create = async (req, res) => {
            try {
                const authUser = req.authUser;
                const payloadValue = await this.generateSummaryTextSchema
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
                this.payload = req.body;
                let llm = await (0, llm_1.getLlm)();
                const lang = this.getLanguageName(payloadValue.language || "en");
                const prompt = prompts_1.PromptTemplate.fromTemplate(`
You are an intelligent AI assistant that extracts a concise and meaningful summary from the given text.

Instructions:
- The output language must be ${lang}.
- Analyze the text and generate a clean, simple, and accurate summary paragraph in ${lang}.
- The final result must be a JSON object containing ONLY two fields: "summary" (a string containing the summarized text) and "title" (a string in ${lang}).
- Do NOT generate action points or key points. Just a plain summary paragraph.
- Do NOT add any extra explanation or text outside the JSON.

Context: {context}
`).pipe(llm);
                res.setHeader("Content-Type", "text/event-stream");
                res.setHeader("Cache-Control", "no-cache");
                res.setHeader("Connection", "keep-alive");
                // @ts-ignore
                if (res.flushHeaders)
                    res.flushHeaders();
                const result = await prompt.stream({
                    context: payloadValue.text,
                    language: payloadValue.language
                });
                let resultString = "";
                for await (const chunk of result) {
                    const content = String(chunk.content || "");
                    resultString += content;
                    res.write(`event: answer\n`);
                    res.write(`data: ${JSON.stringify(content)}\n\n`);
                }
                let parsed = {};
                try {
                    const jsonMatch = resultString.match(/\{[\s\S]*\}/);
                    const cleanJson = jsonMatch ? jsonMatch[0] : resultString.replace(/```json\n?|\n```/g, "");
                    parsed = JSON.parse(cleanJson);
                }
                catch (e) {
                    console.error("JSON Parse Error in Text Summary:", e);
                    parsed = {
                        summary: resultString,
                        title: "Untitled",
                    };
                }
                let summaryText = parsed.summary;
                if (Array.isArray(summaryText)) {
                    summaryText = summaryText.join("\n");
                }
                else if (typeof summaryText === "object" && summaryText !== null) {
                    summaryText = JSON.stringify(summaryText);
                }
                else if (typeof summaryText !== "string") {
                    summaryText = String(summaryText || "");
                }
                const jsonResult = {
                    summarization: summaryText,
                    title: parsed.title || parsed.Heading || "Untitled",
                    actionPoints: parsed.actionpoints || parsed.actionPoints || [],
                    keyPoints: parsed.keypoints || parsed.keyPoints || [],
                    userId: authUser._id,
                    aiResponse: JSON.stringify(parsed),
                };
                const savedData = await (0, generateSummaryFromText_1.saveGeneratedSummaryFromText)(new generateSummaryFromText_1.GenerateSummaryText({
                    ...payloadValue,
                    ...jsonResult,
                }));
                await (0, deductCredit_1.deductCreditFromUserAccount)(authUser._id);
                await (0, history_1.saveHistory)(new history_1.History({
                    modelId: [savedData._id],
                    modelName: history_1.getModelByName.SummaryText,
                    userId: authUser._id.toString(),
                }));
                res.write(`event: metadata\n`);
                res.write(`data: ${JSON.stringify(savedData)}\n\n`);
                res.write(`event: done\ndata: {}\n\n`);
                res.end();
            }
            catch (error) {
                console.log("error", "error in create generatedSummary", error);
                if (!res.headersSent) {
                    return res.status(500).json({
                        message: `Error: ${error.message || "Something went wrong"}`,
                        error: error.stack || error.message || JSON.stringify(error),
                    });
                }
                res.end();
            }
        };
        this.createDirect = async (req, res) => {
            try {
                const authUser = req.authUser;
                const payloadValue = await this.generateSummaryTextSchema
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
                this.payload = req.body;
                let llm = await (0, llm_1.getLlm)();
                const lang = this.getLanguageName(payloadValue.language || "en");
                const prompt = prompts_1.PromptTemplate.fromTemplate(`
You are an intelligent AI assistant that extracts a concise and meaningful summary from the given text.

Instructions:
- The output language must be ${lang}.
- Analyze the text and generate a clean, simple, and accurate summary paragraph in ${lang}.
- The final result must be a JSON object containing ONLY two fields: "summary" (a string containing the summarized text) and "title" (a string in ${lang}).
- Do NOT generate action points or key points. Just a plain summary paragraph.
- Do NOT add any extra explanation or text outside the JSON.

Context: {context}
`).pipe(llm);
                const result = await prompt.invoke({
                    context: payloadValue.text,
                    language: payloadValue.language
                });
                const resultString = String(result.content || "");
                let parsed = {};
                try {
                    const jsonMatch = resultString.match(/\{[\s\S]*\}/);
                    const cleanJson = jsonMatch ? jsonMatch[0] : resultString.replace(/```json\n?|\n```/g, "");
                    parsed = JSON.parse(cleanJson);
                }
                catch (e) {
                    console.error("JSON Parse Error in Text Summary (Direct):", e);
                    parsed = {
                        summary: resultString,
                        title: "Untitled",
                    };
                }
                let summaryText = parsed.summary;
                if (Array.isArray(summaryText)) {
                    summaryText = summaryText.join("\n");
                }
                else if (typeof summaryText === "object" && summaryText !== null) {
                    summaryText = JSON.stringify(summaryText);
                }
                else if (typeof summaryText !== "string") {
                    summaryText = String(summaryText || "");
                }
                const jsonResult = {
                    summarization: summaryText,
                    title: parsed.title || parsed.Heading || "Untitled",
                    actionPoints: parsed.actionpoints || parsed.actionPoints || [],
                    keyPoints: parsed.keypoints || parsed.keyPoints || [],
                    userId: authUser._id,
                    aiResponse: JSON.stringify(parsed),
                };
                const savedData = await (0, generateSummaryFromText_1.saveGeneratedSummaryFromText)(new generateSummaryFromText_1.GenerateSummaryText({
                    ...payloadValue,
                    ...jsonResult,
                }));
                await (0, deductCredit_1.deductCreditFromUserAccount)(authUser._id);
                await (0, history_1.saveHistory)(new history_1.History({
                    modelId: [savedData._id],
                    modelName: history_1.getModelByName.SummaryText,
                    userId: authUser._id.toString(),
                }));
                return res.status(200).json({
                    result: savedData,
                });
            }
            catch (error) {
                console.log("error", "error in create generatedSummary", error);
                return res.status(500).json({
                    message: `Error: ${error.message || "Something went wrong"}`,
                    error: error.stack || error.message || JSON.stringify(error),
                });
            }
        };
        this.update = async (req, res) => {
            const authUser = req.authUser;
            const summaryId = req.params.id;
            try {
                const payloadValue = await this.generatedSummaryTextEditScheam
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
                const summary = await (0, generateSummaryFromText_1.checkTextSummaryIsExistById)(summaryId, authUser._id);
                if (!summary) {
                    return res
                        .status(http_status_codes_1.StatusCodes.NOT_FOUND)
                        .json({ message: "Summary not found", success: false });
                }
                const updated = await (0, generateSummaryFromText_1.updateTextSummary)(summaryId, payloadValue);
                return res
                    .status(http_status_codes_1.StatusCodes.OK)
                    .json({ message: "Summary updated", success: true, result: updated });
            }
            catch (error) {
                let errorMessage = "An error occurred";
                let statusCode = http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR;
                if (error && error.isJoi) {
                    errorMessage = error.message;
                    statusCode = http_status_codes_1.StatusCodes.UNPROCESSABLE_ENTITY;
                }
                else {
                    console.log("error", "error in generate summary from text", error);
                    errorMessage =
                        error.message || "Something went wrong, please try again";
                }
                return res
                    .status(statusCode)
                    .json({ success: false, message: errorMessage });
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
                await (0, generateSummaryFromText_1.deletedSummary)(summary._id);
                return res
                    .status(http_status_codes_1.StatusCodes.OK)
                    .json({ message: "Summary Deleted", success: true });
            }
            catch (error) {
                if (error && error.isJoi) {
                    return res.status(422).json({ message: error.message });
                }
                console.log("error", "error in delete text summary", error);
                return res.status(500).json({
                    message: "Something happened wrong try again delete summary after sometime",
                    error: JSON.stringify(error.message),
                });
            }
        };
    }
    getLanguageName(code) {
        const mapping = {
            en: "English",
            hi: "Hindi",
            gu: "Gujarati",
            es: "Spanish",
            fr: "French",
            de: "German",
        };
        return mapping[code.toLowerCase()] || code;
    }
}
exports.Controller = Controller;
//# sourceMappingURL=generatedSummaryText.js.map