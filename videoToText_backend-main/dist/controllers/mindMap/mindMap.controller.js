"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const llm_1 = require("../../llm");
const getSummaryFromSource_1 = require("../../modules/chatWithAI/getSummaryFromSource");
const http_status_codes_1 = require("http-status-codes");
const prompts_1 = require("@langchain/core/prompts");
const saveMindMap_1 = require("../../modules/mindMap/saveMindMap");
const deductCredit_1 = require("../../modules/user/deductCredit");
const getMindMapBySummary_1 = require("../../modules/mindMap/getMindMapBySummary");
const history_1 = require("../../modules/history");
const mongoose_1 = require("mongoose");
class Controller {
    constructor() {
        this.createMindMapSchema = joi_1.default.object().keys({
            source: joi_1.default.string()
                .valid("pdf", "video", "audio", "web", "text")
                .required(),
            summaryId: joi_1.default.string().required(),
        });
        this.create = async (req, res) => {
            const authUser = req.authUser;
            try {
                const payloadValue = await this.createMindMapSchema.validateAsync(req.body, {
                    stripUnknown: true,
                });
                this.llm = await (0, llm_1.getLlm)();
                const summary = await (0, getSummaryFromSource_1.getSummaryFromSouceAndSummaryId)(payloadValue.source, payloadValue.summaryId, authUser._id);
                if (!summary) {
                    return res
                        .status(http_status_codes_1.StatusCodes.NOT_FOUND)
                        .json({ message: "Summary not found", success: false });
                }
                const prompt = `You are a structured data generator that creates mind maps in strict JSON format.

Your output MUST be a valid JSON object following this EXACT schema:
{{
  "title": "Main Title",
  "topics": [
    {{
      "topic": "Topic Name",
      "subtopics": [
        {{
          "subTopic": "Sub-concept",
          "detail": "1-2 sentence explanation"
        }}
      ]
    }}
  ]
}}

Rules:
- Strictly return ONLY a valid JSON object. No extra text, no markdown blocks.
- The "title" should reflect the main theme.
- Each "topic" should cover a major concept.
- Each "subTopic" should be a key idea under that topic.

Context:
"""
{context}
"""

Return the JSON object now.
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
                let parsed = {};
                try {
                    // Strategy 1: strict parse
                    parsed = JSON.parse(content.trim());
                }
                catch (e1) {
                    try {
                        // Strategy 2: Remove markdown code blocks and parse
                        const cleaned = content
                            .replace(/^```(?:json)?\s*\n?/gm, "")
                            .replace(/\n?```\s*$/gm, "")
                            .trim();
                        parsed = JSON.parse(cleaned);
                    }
                    catch (e2) {
                        try {
                            // Strategy 3: Extract JSON object matching '{' and '}'
                            const startIdx = content.indexOf("{");
                            if (startIdx !== -1) {
                                let depth = 0;
                                let endIdx = startIdx;
                                for (let i = startIdx; i < content.length; i++) {
                                    if (content[i] === "{")
                                        depth++;
                                    else if (content[i] === "}") {
                                        depth--;
                                        if (depth === 0) {
                                            endIdx = i;
                                            break;
                                        }
                                    }
                                }
                                const jsonStr = content.substring(startIdx, endIdx + 1);
                                parsed = JSON.parse(jsonStr);
                            }
                            else {
                                throw new Error("No JSON object found");
                            }
                        }
                        catch (e3) {
                            console.error("All JSON parse strategies failed for Mindmap:", e3);
                            throw new Error(`AI generated invalid JSON format for mindmap. Raw content: ${content.substring(0, 100)}...`);
                        }
                    }
                }
                console.log(parsed);
                let commonData = {
                    ...payloadValue,
                    userId: authUser._id,
                };
                const data = await (0, saveMindMap_1.saveMindMap)({ ...parsed, ...commonData });
                await (0, deductCredit_1.deductCreditFromUserAccount)(authUser._id);
                await (0, history_1.saveHistory)(new history_1.History({
                    modelId: [new mongoose_1.Types.ObjectId(data._id)],
                    modelName: history_1.getModelByName.MindMap,
                    userId: authUser._id.toString(),
                }));
                return res.status(http_status_codes_1.StatusCodes.OK).json({
                    message: "Mind Map Generated",
                    success: true,
                    result: data,
                });
            }
            catch (error) {
                if (error.isJoi) {
                    return res.status(422).json({ message: error.message });
                }
                console.log("error", "error in create mind map", error);
                return res.status(500).json({
                    message: `Mindmap Generation Error: ${error.message || "Something went wrong"}`,
                    error: error.stack || error.message || JSON.stringify(error),
                });
            }
        };
        this.getMindMapBySummary = async (req, res) => {
            const authUser = req.authUser;
            try {
                const payloadValue = await this.createMindMapSchema.validateAsync(req.body, {
                    stripUnknown: true,
                });
                const summary = await (0, getSummaryFromSource_1.getSummaryFromSouceAndSummaryId)(payloadValue.source, payloadValue.summaryId, authUser._id);
                if (!summary) {
                    return res
                        .status(http_status_codes_1.StatusCodes.NOT_FOUND)
                        .json({ message: "Summary not found", success: false });
                }
                const data = await (0, getMindMapBySummary_1.getMindmapSummary)(summary._id, payloadValue.source, authUser._id);
                if (!data) {
                    return res
                        .status(http_status_codes_1.StatusCodes.NOT_FOUND)
                        .json({ message: "Mind map not found", success: false });
                }
                return res.status(http_status_codes_1.StatusCodes.OK).json({
                    message: "Fetched Mind Map",
                    success: true,
                    result: data,
                });
            }
            catch (error) {
                if (error.isJoi) {
                    return res.status(422).json({ message: error.message });
                }
                console.log("error", "error in create mind map", error);
                return res.status(500).json({
                    message: "Something happened wrong try again mind map after sometime",
                    error: JSON.stringify(error.message),
                });
            }
        };
    }
}
exports.default = Controller;
//# sourceMappingURL=mindMap.controller.js.map