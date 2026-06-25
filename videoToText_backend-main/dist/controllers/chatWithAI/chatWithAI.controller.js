"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const llm_1 = require("../../llm");
const prompts_1 = require("@langchain/core/prompts");
const combine_documents_1 = require("langchain/chains/combine_documents");
const documents_1 = require("@langchain/core/documents");
const joi_1 = __importDefault(require("joi"));
const generatedSummaryFromPdf_1 = require("../../modules/generatedSummaryFromPdf");
const generatedSummaryFromAudio_1 = require("../../modules/generatedSummaryFromAudio");
const http_status_codes_1 = require("http-status-codes");
const generateSummaryFromYoutube_1 = require("../../modules/generateSummaryFromYoutube");
const google_genai_1 = require("@langchain/google-genai");
const memory_1 = require("langchain/vectorstores/memory");
const messages_1 = require("@langchain/core/messages");
const chatWithAI_1 = require("../../modules/chatWithAI");
const deductCredit_1 = require("../../modules/user/deductCredit");
const redis_1 = require("../../redis");
const generatedSummaryFromWeb_1 = require("../../modules/generatedSummaryFromWeb");
const recursive_url_1 = require("@langchain/community/document_loaders/web/recursive_url");
const generateSummaryFromText_1 = require("../../modules/generateSummaryFromText");
class Controller {
    constructor() {
        this.chatHistory = [];
        this.isInitialized = false;
        this.currentContextId = null;
        this.currentUserId = null;
        this.chatSchema = joi_1.default.object().keys({
            source: joi_1.default.string()
                .valid("pdf", "audio", "video", "web", "text")
                .required(),
            summaryId: joi_1.default.string().required(),
            content: joi_1.default.string().optional(),
        });
        this.createChain = async () => {
            const llm = await (0, llm_1.getLlm)();
            this.llm = llm;
            // const memory = new BufferMemory({
            //   memoryKey: "chat_history",
            //   returnMessages: true,
            //   chatHistory: new ChatMessageHistory(),
            // });
            const prompt = prompts_1.ChatPromptTemplate.fromMessages([
                [
                    "system",
                    "You are an AI assistant. Use the following context to answer: {context}",
                ],
                new prompts_1.MessagesPlaceholder("chat_history"),
                ["user", "{input}"],
            ]);
            const chain = await (0, combine_documents_1.createStuffDocumentsChain)({ llm, prompt });
            return { chain };
        };
        this.createVectorStore = async (payloadValue) => {
            var _a, _b, _c;
            const docs = [
                new documents_1.Document({ pageContent: JSON.stringify((_a = this.summary) === null || _a === void 0 ? void 0 : _a.aiResponse) }),
            ];
            if (payloadValue.source === "web") {
                const loader = new recursive_url_1.RecursiveUrlLoader((_b = this.summary) === null || _b === void 0 ? void 0 : _b.url, {});
                const webDocs = await loader.load();
                docs.push(new documents_1.Document({ pageContent: (_c = webDocs[0]) === null || _c === void 0 ? void 0 : _c.pageContent }));
            }
            const embedding = new google_genai_1.GoogleGenerativeAIEmbeddings({
                apiKey: process.env.GOOGLE_API_KEY,
                modelName: "text-embedding-004",
            });
            // const embedding = new OpenAIEmbeddings({
            //   apiKey: process.env.OPENAI_API_KEY,
            // });
            const vectorStore = await memory_1.MemoryVectorStore.fromDocuments(docs, embedding);
            const retriver = await vectorStore.asRetriever({ k: 7 });
            return retriver;
        };
        this.docs = [];
        this.initializeRetrievalChain = async (payloadValue) => {
            var _a, _b;
            const { chain } = await this.createChain();
            // Create documents from summary context
            const docs = [
                new documents_1.Document({ pageContent: JSON.stringify(((_a = this.summary) === null || _a === void 0 ? void 0 : _a.aiResponse) || this.summary) }),
            ];
            // Handle web source if needed
            if (payloadValue.source === "web" && ((_b = this.summary) === null || _b === void 0 ? void 0 : _b.url)) {
                try {
                    const loader = new recursive_url_1.RecursiveUrlLoader(this.summary.url, {});
                    const webDocs = await loader.load();
                    if (webDocs.length > 0) {
                        docs.push(new documents_1.Document({ pageContent: webDocs[0].pageContent }));
                    }
                }
                catch (err) {
                    console.error("Web documentation loading failed", err);
                }
            }
            this.docs = docs;
            // Create a direct retrieval chain that doesn't need embeddings
            this.retrievalChain = {
                invoke: async (input) => {
                    const answer = await chain.invoke({
                        input: input.input,
                        chat_history: input.chat_history,
                        context: this.docs,
                    });
                    return { answer };
                },
            };
            this.isInitialized = true;
            this.currentContextId = payloadValue.summaryId;
            this.currentUserId = payloadValue.userId;
        };
        this.isContextChanged = (summaryId, userId) => {
            return this.currentContextId !== summaryId || this.currentUserId !== userId;
        };
        this.create = async (req, res) => {
            try {
                const authuser = req.authUser;
                const payloadValue = await this.chatSchema.validateAsync(req.body, {
                    stripUnknown: true,
                });
                if (!this.isInitialized ||
                    !this.initializeRetrievalChain ||
                    !this.summary) {
                    return res.status(400).json({
                        message: "Please initialize the chat first by calling /enterToChat.",
                        success: false,
                    });
                }
                if (this.isContextChanged(payloadValue.summaryId, authuser._id.toString())) {
                    return res.status(400).json({
                        message: "Context has changed. Please reinitialize the chat by calling /enterToChat.",
                        success: false,
                    });
                }
                let chatData = {
                    contextId: payloadValue.summaryId,
                    source: payloadValue.source,
                    userId: authuser, // Ensure userId is IUser or ObjectId
                };
                this.chatHistory.push(new messages_1.HumanMessage(payloadValue.content));
                let totalResponse = [];
                totalResponse.push(await (0, chatWithAI_1.saveChat)({
                    content: payloadValue.content,
                    messageType: "human",
                    ...chatData,
                }));
                const response = await this.retrievalChain.invoke({
                    input: payloadValue.content,
                    chat_history: this.chatHistory,
                });
                this.chatHistory.push(new messages_1.AIMessage(response.answer));
                totalResponse.push(await (0, chatWithAI_1.saveChat)({
                    content: response.answer,
                    messageType: "ai",
                    ...chatData,
                }));
                await (0, deductCredit_1.deductCreditFromUserAccount)(authuser._id);
                res.status(http_status_codes_1.StatusCodes.OK).json({
                    message: "Response from AI",
                    result: totalResponse,
                    summaryData: this.summary,
                    success: true,
                });
            }
            catch (error) {
                if (error.isJoi) {
                    return res.status(422).json({ message: error.message });
                }
                console.log("error", "error in create chat with ai", error);
                return res.status(500).json({
                    message: "Something happened wrong try again chat with ai after sometime",
                    error: JSON.stringify(error.message),
                });
            }
        };
        this.enterChat = async (req, res) => {
            try {
                const authuser = req.authUser;
                let chats;
                const payloadValue = await this.chatSchema.validateAsync(req.body, {
                    stripUnknown: true,
                });
                let summary;
                switch (payloadValue.source) {
                    case "pdf":
                        const isPdfSummary = await (0, generatedSummaryFromPdf_1.checkPdfSummaryIsExistById)(payloadValue.summaryId, authuser._id);
                        if (!isPdfSummary) {
                            return res
                                .status(http_status_codes_1.StatusCodes.NOT_FOUND)
                                .json({ message: "PDF Summary is not exists.", success: false });
                        }
                        summary = isPdfSummary;
                        break;
                    case "audio":
                        const isAudioSummary = await (0, generatedSummaryFromAudio_1.checkAudioSummaryIsExistById)(payloadValue.summaryId, authuser._id);
                        if (!isAudioSummary) {
                            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({
                                message: "Audio Summary is not exists.",
                                success: false,
                            });
                        }
                        summary = isAudioSummary;
                        break;
                    case "video":
                        const isVideoSummary = await (0, generateSummaryFromYoutube_1.checkVideoSummaryIsExistById)(payloadValue.summaryId, authuser._id);
                        if (!isVideoSummary) {
                            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({
                                message: "Video Summary is not exists.",
                                success: false,
                            });
                        }
                        summary = isVideoSummary;
                        break;
                    case "web":
                        const isWebSummary = await (0, generatedSummaryFromWeb_1.checkWebSummaryIsExistById)(payloadValue.summaryId, authuser._id);
                        if (!isWebSummary) {
                            return res
                                .status(http_status_codes_1.StatusCodes.NOT_FOUND)
                                .json({ message: "Web Summary is not exists.", success: false });
                        }
                        summary = isWebSummary;
                        break;
                    case "text":
                        const textSummary = await (0, generateSummaryFromText_1.checkTextSummaryIsExistById)(payloadValue.summaryId, authuser._id);
                        if (!textSummary) {
                            return res
                                .status(http_status_codes_1.StatusCodes.NOT_FOUND)
                                .json({ message: "Text Summary not found", success: false });
                        }
                        summary = textSummary;
                        break;
                    default:
                        return res
                            .status(http_status_codes_1.StatusCodes.BAD_REQUEST)
                            .json({ message: "Invalid Source Type", success: false });
                }
                this.summary = summary;
                let chatData = {
                    contextId: payloadValue.summaryId,
                    source: payloadValue.source,
                    userId: authuser, // Ensure userId is IUser or ObjectId
                };
                const isContextChanged = this.isContextChanged(payloadValue.summaryId, authuser._id.toString());
                if (isContextChanged || !this.isInitialized) {
                    await this.initializeRetrievalChain({
                        ...payloadValue,
                        userId: authuser._id,
                    });
                }
                chats = await (0, chatWithAI_1.getChatFromSummaryId)({ ...chatData });
                if (chats.length === 0) {
                    const greeting = "Hello AI,";
                    const aiReply = `Hey ${(authuser === null || authuser === void 0 ? void 0 : authuser.firstName) || "there"}, How can I help you?`;
                    this.chatHistory.push(new messages_1.HumanMessage(greeting));
                    this.chatHistory.push(new messages_1.AIMessage(aiReply));
                    await (0, chatWithAI_1.saveChat)({
                        content: greeting,
                        messageType: "human",
                        ...chatData,
                    });
                    await (0, chatWithAI_1.saveChat)({ content: aiReply, messageType: "ai", ...chatData });
                    chats = await (0, chatWithAI_1.getChatFromSummaryId)({ ...chatData });
                }
                this.chatHistory = chats.map((chat) => chat.messageType === "human"
                    ? new messages_1.HumanMessage(chat.content)
                    : new messages_1.AIMessage(chat.content));
                const cacheKey = `chat:${payloadValue.source}:${payloadValue.summaryId}:${authuser._id}`;
                let data;
                try {
                    const redisData = await redis_1.redis.get(cacheKey);
                    data = redisData ? JSON.parse(redisData) : null;
                }
                catch (e) {
                    console.error("Redis read error", e);
                    data = null;
                }
                if (!data || data.length === 0) {
                    data = chats;
                    try {
                        await redis_1.redis.set(cacheKey, JSON.stringify(chats), { EX: 60 * 5 });
                    }
                    catch (e) {
                        console.error("Redis write error", e);
                    }
                }
                res.status(http_status_codes_1.StatusCodes.OK).json({
                    message: "Fetched Chat with AI",
                    result: data,
                    summaryData: summary,
                    success: true,
                });
            }
            catch (error) {
                if (error.isJoi) {
                    return res.status(422).json({ message: error.message });
                }
                console.log("error", "error in create chat with ai", error);
                return res.status(500).json({
                    message: "Something happened wrong try again chat with ai after sometime",
                    error: JSON.stringify(error.message),
                });
            }
        };
    }
}
exports.default = Controller;
//# sourceMappingURL=chatWithAI.controller.js.map