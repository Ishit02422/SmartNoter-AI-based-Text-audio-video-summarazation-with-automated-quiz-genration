"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const llm_1 = require("../../llm");
const prompts_1 = require("@langchain/core/prompts");
const getSummaryFromSource_1 = require("../../modules/chatWithAI/getSummaryFromSource");
const joi_1 = __importDefault(require("joi"));
const http_status_codes_1 = require("http-status-codes");
const flashcard_1 = require("../../modules/flashcard");
const deductCredit_1 = require("../../modules/user/deductCredit");
const history_1 = require("../../modules/history");
const axios_1 = __importDefault(require("axios"));
class Controller {
    constructor() {
        this.createFlashCardSchema = joi_1.default.object().keys({
            source: joi_1.default.string()
                .valid("pdf", "video", "audio", "web", "text")
                .required(),
            summaryId: joi_1.default.string().required(),
        });
        this.generateImage = async (que) => {
            var _a, _b;
            try {
                if (!process.env.UNSPLASH_ACCESS_KEY || process.env.UNSPLASH_ACCESS_KEY === 'undefined') {
                    console.warn("UNSPLASH_ACCESS_KEY is missing. Skipping image generation.");
                    return null;
                }
                const res = await axios_1.default.get(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(que)}&client_id=${process.env.UNSPLASH_ACCESS_KEY}`, { timeout: 5000 } // Add timeout to prevent hanging
                );
                if (res.data && res.data.results && res.data.results.length > 0) {
                    return ((_a = res.data.results[0].urls) === null || _a === void 0 ? void 0 : _a.regular) || ((_b = res.data.results[0].urls) === null || _b === void 0 ? void 0 : _b.full);
                }
                return null;
            }
            catch (error) {
                console.error("Error generating image from Unsplash:", error.message);
                return null; // Return null instead of throwing to avoid breaking the whole flow
            }
        };
        this.create = async (req, res) => {
            const authUser = req.authUser;
            try {
                const payloadValue = await this.createFlashCardSchema.validateAsync(req.body, {
                    stripUnknown: true,
                });
                this.llm = await (0, llm_1.getLlm)();
                const summary = await (0, getSummaryFromSource_1.getSummaryFromSouceAndSummaryId)(payloadValue.source, payloadValue.summaryId, authUser._id);
                if (!summary) {
                    return res
                        .status(http_status_codes_1.StatusCodes.NOT_FOUND)
                        .json({ message: "Summary not found", success: false });
                }
                const prompt = `You are an intelligent assistant that generates flashcards for users in strict JSON format.

Instructions:
1. Generate concise question-answer flashcards based only on the context below.
2. Strictly return ONLY a valid JSON array of objects. No extra text, no markdown blocks.
3. Every object MUST have "Q" (question) and "A" (answer) keys.
4. Output Schema:
[
  {{
    "Q": "The question?",
    "A": "The answer"
  }}
]

Context:
"""
{context}
"""

Return minimum 4 and maximum 8 flashcards in JSON format.
`;
                const systemPrompt = prompts_1.ChatPromptTemplate.fromTemplate(prompt).pipe(this.llm);
                const contextStr = JSON.stringify({
                    summary: (summary === null || summary === void 0 ? void 0 : summary.summarization) || (summary === null || summary === void 0 ? void 0 : summary.summary),
                    transcript: summary === null || summary === void 0 ? void 0 : summary.transcript,
                    actionPoints: summary === null || summary === void 0 ? void 0 : summary.actionPoints,
                    keyPoints: summary === null || summary === void 0 ? void 0 : summary.keyPoints,
                });
                const result = await systemPrompt.invoke({ context: contextStr });
                let content;
                if (typeof result === "string") {
                    content = result;
                }
                else if (result && typeof result === "object" && "content" in result) {
                    content = result.content;
                }
                else {
                    throw new Error("Unexpected result type from systemPrompt.invoke");
                }
                let parsed = [];
                try {
                    const jsonMatch = content.match(/\[[\s\S]*\]/);
                    const cleanJson = jsonMatch ? jsonMatch[0] : content.replace(/```json\n?|\n```/g, "").trim();
                    parsed = JSON.parse(cleanJson);
                }
                catch (e) {
                    console.error("JSON Parse Error in Flashcard:", e);
                    throw new Error(`AI generated invalid JSON format for flashcards. Raw content: ${content.substring(0, 100)}...`);
                }
                if (!Array.isArray(parsed)) {
                    throw new Error("AI generated invalid flashcard format: expected an array");
                }
                let storedData = [];
                let commonData = {
                    ...payloadValue,
                    userId: authUser._id,
                };
                for (const value of parsed) {
                    const que = (value === null || value === void 0 ? void 0 : value.Q) || "N/A";
                    const url = await this.generateImage(que);
                    storedData.push({
                        ...commonData,
                        que: value.Q,
                        ans: value.A,
                        imageUrl: url,
                    });
                }
                const data = await (0, flashcard_1.saveFlashCard)(storedData);
                await (0, deductCredit_1.deductCreditFromUserAccount)(authUser._id);
                const modelIds = Array.isArray(data)
                    ? data.map((card) => card._id)
                    : [data._id];
                await (0, history_1.saveHistory)(new history_1.History({
                    modelId: modelIds,
                    modelName: history_1.getModelByName.FlashCard,
                    userId: authUser._id.toString(),
                }));
                return res.status(http_status_codes_1.StatusCodes.OK).json({
                    message: "Flash Card Generated",
                    success: true,
                    result: { summary, flashcards: data },
                });
            }
            catch (error) {
                if (error.isJoi) {
                    return res.status(422).json({ message: error.message });
                }
                console.log("error", "error in create flash card", error);
                return res.status(500).json({
                    message: `Flashcard Generation Error: ${error.message || "Something went wrong"}`,
                    error: error.stack || error.message || JSON.stringify(error),
                });
            }
        };
        this.getAllFlashCards = async (req, res) => {
            const authUser = req.authUser;
            try {
                const payloadValue = await this.createFlashCardSchema.validateAsync(req.body, {
                    stripUnknown: true,
                });
                const summary = await (0, getSummaryFromSource_1.getSummaryFromSouceAndSummaryId)(payloadValue.source, payloadValue.summaryId, authUser._id);
                const cards = await (0, flashcard_1.getFlashCard)(payloadValue.source, payloadValue.summaryId, authUser._id);
                return res.status(http_status_codes_1.StatusCodes.OK).json({
                    message: "Flash Card Fetched",
                    success: true,
                    result: { flashcards: cards, summary },
                });
            }
            catch (error) {
                if (error.isJoi) {
                    return res.status(422).json({ message: error.message });
                }
                console.log("error", "error in create flash card", error);
                return res.status(500).json({
                    message: "Something happened wrong try again flash card after sometime",
                    error: JSON.stringify(error.message),
                });
            }
        };
    }
}
exports.default = Controller;
//# sourceMappingURL=flashcard.controller.js.map