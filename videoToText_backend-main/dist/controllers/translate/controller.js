"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const llm_1 = require("../../llm");
const http_status_codes_1 = require("http-status-codes");
const prompts_1 = require("@langchain/core/prompts");
const deductCredit_1 = require("../../modules/user/deductCredit");
const getSummaryFromSource_1 = require("../../modules/chatWithAI/getSummaryFromSource");
const getTranslatedSummary_1 = require("../../modules/translate/getTranslatedSummary");
const saveTranslatedSummary_1 = require("../../modules/translate/saveTranslatedSummary");
const history_1 = require("../../modules/history");
class Controller {
    constructor() {
        this.translateSummarySchema = joi_1.default.object().keys({
            source: joi_1.default.string()
                .valid("pdf", "audio", "video", "web", "text")
                .required(),
            summaryId: joi_1.default.string().required(),
            language: joi_1.default.string()
                .custom((value) => {
                return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
            })
                .required(),
        });
        this.create = async (req, res) => {
            try {
                const authuser = req.authUser;
                const payloadValue = await this.translateSummarySchema
                    .validateAsync(req.body)
                    .catch((e) => {
                    if (e instanceof Error) {
                        return res.status(422).json({ message: e.message });
                    }
                    return res.status(422).json({ message: "Invalid payload" });
                });
                const llm = await (0, llm_1.getLlm)();
                const summary = await (0, getSummaryFromSource_1.getSummaryFromSouceAndSummaryId)(payloadValue.source, payloadValue.summaryId, authuser._id);
                if (!summary) {
                    return res
                        .status(http_status_codes_1.StatusCodes.NOT_FOUND)
                        .json({ message: "Summary not found", success: false });
                }
                const data = await (0, getTranslatedSummary_1.getTranslatedSummary)(summary._id, payloadValue.source, payloadValue.language, authuser._id);
                if (data) {
                    return res.status(http_status_codes_1.StatusCodes.OK).json({
                        message: "Translated Successfully",
                        result: data,
                        success: true,
                    });
                }
                const prompt = `You are an intelligent AI assistant.

Your task is to translate the given summary into the specified language.

Instructions:
- Translate the summary to the given language.
- Keep it natural and meaningful.
- Respond only with the translated summary as plain text.
- Do NOT include any metadata, labels, or explanations.

      input:{input}
      context: {context}

      Output: (Only translated summary)
      `;
                const promptSystem = prompts_1.ChatPromptTemplate.fromTemplate(prompt).pipe(llm);
                const result = await promptSystem.invoke({
                    context: summary.summarization || summary.summary,
                    input: `translate summary into ${payloadValue.language} language with bullet points format`,
                });
                const translatedData = {
                    source: payloadValue.source,
                    originalSummary: summary.summarization || summary.summary,
                    summaryId: summary._id,
                    translatedLanguage: payloadValue.language,
                    translatedSummary: result.content,
                    userId: authuser._id.toString(),
                    title: `Translate Summary: ${(summary === null || summary === void 0 ? void 0 : summary.title) || (summary === null || summary === void 0 ? void 0 : summary.topic)} into ${payloadValue.language} language`,
                };
                const savedData = await (0, saveTranslatedSummary_1.saveTranslatedSummary)(translatedData);
                await (0, deductCredit_1.deductCreditFromUserAccount)(authuser._id);
                await (0, history_1.saveHistory)(new history_1.History({
                    modelId: [savedData._id],
                    modelName: history_1.getModelByName.Translate,
                    userId: authuser._id.toString(),
                }));
                return res.status(http_status_codes_1.StatusCodes.OK).json({
                    message: "Translated Successfully",
                    success: true,
                    result: savedData,
                });
            }
            catch (error) {
                console.log("error", "error in translate summary", error);
                return res.status(500).json({
                    message: "Something happened wrong try again translate Summary after sometime",
                    error: JSON.stringify(error.message),
                });
            }
        };
    }
}
exports.default = Controller;
//# sourceMappingURL=controller.js.map