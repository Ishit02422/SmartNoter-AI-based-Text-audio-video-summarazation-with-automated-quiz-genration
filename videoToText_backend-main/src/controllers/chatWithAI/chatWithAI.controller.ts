import { Response } from "express";
import { Request } from "../../request";
import { getLlm } from "../../llm";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { Document } from "@langchain/core/documents";
import Joi from "joi";
import { checkPdfSummaryIsExistById } from "../../modules/generatedSummaryFromPdf";
import { checkAudioSummaryIsExistById } from "../../modules/generatedSummaryFromAudio";
import { StatusCodes } from "http-status-codes";
import { checkVideoSummaryIsExistById } from "../../modules/generateSummaryFromYoutube";
import { LanguageModelLike } from "@langchain/core/language_models/base";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { BufferMemory, ChatMessageHistory } from "langchain/memory";
import { IUser } from "../../modules/user";
import {
  getChatFromSummaryId,
  IChatWithAi,
  saveChat,
} from "../../modules/chatWithAI";
import { deductCreditFromUserAccount } from "../../modules/user/deductCredit";
import { redis } from "../../redis";
import { checkWebSummaryIsExistById } from "../../modules/generatedSummaryFromWeb";
import { RecursiveUrlLoader } from "@langchain/community/document_loaders/web/recursive_url";
import { checkTextSummaryIsExistById } from "../../modules/generateSummaryFromText";

export default class Controller {
  private summary: any;
  private llm: LanguageModelLike;
  private chatHistory = [];
  private retrievalChain;
  private isInitialized = false;
  private currentContextId: string | null = null;
  private currentUserId: string | null = null;

  protected readonly chatSchema: Joi.ObjectSchema = Joi.object().keys({
    source: Joi.string()
      .valid("pdf", "audio", "video", "web", "text")
      .required(),
    summaryId: Joi.string().required(),
    content: Joi.string().optional(),
  });

  private createChain = async () => {
    const llm: LanguageModelLike = await getLlm();
    this.llm = llm;
    // const memory = new BufferMemory({
    //   memoryKey: "chat_history",
    //   returnMessages: true,
    //   chatHistory: new ChatMessageHistory(),
    // });
    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        "You are an AI assistant. Use the following context to answer: {context}",
      ],
      new MessagesPlaceholder("chat_history"),
      ["user", "{input}"],
    ]);
    const chain = await createStuffDocumentsChain({ llm, prompt });
    return { chain };
  };

  private createVectorStore = async (payloadValue) => {
    const docs = [
      new Document({ pageContent: JSON.stringify(this.summary?.aiResponse) }),
    ];
    if (payloadValue.source === "web") {
      const loader = new RecursiveUrlLoader(this.summary?.url, {});
      const webDocs = await loader.load();

      docs.push(new Document({ pageContent: webDocs[0]?.pageContent }));
    }
    const embedding = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GOOGLE_API_KEY,
      modelName: "text-embedding-004",
    });
    // const embedding = new OpenAIEmbeddings({
    //   apiKey: process.env.OPENAI_API_KEY,
    // });
    const vectorStore = await MemoryVectorStore.fromDocuments(docs, embedding);
    const retriver = await vectorStore.asRetriever({ k: 7 });
    return retriver;
  };

  private docs: Document[] = [];

  private initializeRetrievalChain = async (payloadValue) => {
    const { chain } = await this.createChain();
    
    // Create documents from summary context
    const docs = [
      new Document({ pageContent: JSON.stringify(this.summary?.aiResponse || this.summary) }),
    ];
    
    // Handle web source if needed
    if (payloadValue.source === "web" && this.summary?.url) {
      try {
        const loader = new RecursiveUrlLoader(this.summary.url, {});
        const webDocs = await loader.load();
        if (webDocs.length > 0) {
          docs.push(new Document({ pageContent: webDocs[0].pageContent }));
        }
      } catch (err) {
        console.error("Web documentation loading failed", err);
      }
    }

    this.docs = docs;
    
    // Create a direct retrieval chain that doesn't need embeddings
    this.retrievalChain = {
      invoke: async (input: { input: string; chat_history: any[] }) => {
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

  private isContextChanged = (summaryId: string, userId: string): boolean => {
    return this.currentContextId !== summaryId || this.currentUserId !== userId;
  };
  protected readonly create = async (req: Request, res: Response) => {
    try {
      const authuser = req.authUser;
      const payloadValue = await this.chatSchema.validateAsync(req.body, {
        stripUnknown: true,
      });
      if (
        !this.isInitialized ||
        !this.initializeRetrievalChain ||
        !this.summary
      ) {
        return res.status(400).json({
          message: "Please initialize the chat first by calling /enterToChat.",
          success: false,
        });
      }

      if (
        this.isContextChanged(payloadValue.summaryId, authuser._id.toString())
      ) {
        return res.status(400).json({
          message:
            "Context has changed. Please reinitialize the chat by calling /enterToChat.",
          success: false,
        });
      }

      let chatData = {
        contextId: payloadValue.summaryId,
        source: payloadValue.source,
        userId: authuser as IUser, // Ensure userId is IUser or ObjectId
      };

      this.chatHistory.push(new HumanMessage(payloadValue.content));
      let totalResponse = [];
      totalResponse.push(
        await saveChat({
          content: payloadValue.content,
          messageType: "human",
          ...chatData,
        })
      );
      const response = await this.retrievalChain.invoke({
        input: payloadValue.content,
        chat_history: this.chatHistory,
      });
      this.chatHistory.push(new AIMessage(response.answer));
      totalResponse.push(
        await saveChat({
          content: response.answer,
          messageType: "ai",
          ...chatData,
        })
      );
      await deductCreditFromUserAccount(authuser._id);
      res.status(StatusCodes.OK).json({
        message: "Response from AI",
        result: totalResponse,
        summaryData: this.summary,
        success: true,
      });
    } catch (error) {
      if (error.isJoi) {
        return res.status(422).json({ message: error.message });
      }
      console.log("error", "error in create chat with ai", error);
      return res.status(500).json({
        message:
          "Something happened wrong try again chat with ai after sometime",
        error: JSON.stringify(error.message),
      });
    }
  };

  protected readonly enterChat = async (req: Request, res: Response) => {
    try {
      const authuser = req.authUser;
      let chats: IChatWithAi[];
      const payloadValue = await this.chatSchema.validateAsync(req.body, {
        stripUnknown: true,
      });
      let summary;
      switch (payloadValue.source) {
        case "pdf":
          const isPdfSummary = await checkPdfSummaryIsExistById(
            payloadValue.summaryId,
            authuser._id
          );
          if (!isPdfSummary) {
            return res
              .status(StatusCodes.NOT_FOUND)
              .json({ message: "PDF Summary is not exists.", success: false });
          }
          summary = isPdfSummary;
          break;
        case "audio":
          const isAudioSummary = await checkAudioSummaryIsExistById(
            payloadValue.summaryId,
            authuser._id
          );
          if (!isAudioSummary) {
            return res.status(StatusCodes.NOT_FOUND).json({
              message: "Audio Summary is not exists.",
              success: false,
            });
          }
          summary = isAudioSummary;
          break;
        case "video":
          const isVideoSummary = await checkVideoSummaryIsExistById(
            payloadValue.summaryId,
            authuser._id
          );
          if (!isVideoSummary) {
            return res.status(StatusCodes.NOT_FOUND).json({
              message: "Video Summary is not exists.",
              success: false,
            });
          }
          summary = isVideoSummary;
          break;
        case "web":
          const isWebSummary = await checkWebSummaryIsExistById(
            payloadValue.summaryId,
            authuser._id
          );
          if (!isWebSummary) {
            return res
              .status(StatusCodes.NOT_FOUND)
              .json({ message: "Web Summary is not exists.", success: false });
          }
          summary = isWebSummary;
          break;
        case "text":
          const textSummary = await checkTextSummaryIsExistById(
            payloadValue.summaryId,
            authuser._id
          );
          if (!textSummary) {
            return res
              .status(StatusCodes.NOT_FOUND)
              .json({ message: "Text Summary not found", success: false });
          }
          summary = textSummary;
          break;
        default:
          return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ message: "Invalid Source Type", success: false });
      }
      this.summary = summary;

      let chatData = {
        contextId: payloadValue.summaryId,
        source: payloadValue.source,
        userId: authuser as IUser, // Ensure userId is IUser or ObjectId
      };
      const isContextChanged = this.isContextChanged(
        payloadValue.summaryId,
        authuser._id.toString()
      );
      if (isContextChanged || !this.isInitialized) {
        await this.initializeRetrievalChain({
          ...payloadValue,
          userId: authuser._id,
        });
      }
      chats = await getChatFromSummaryId({ ...chatData });

      if (chats.length === 0) {
        const greeting = "Hello AI,";
        const aiReply = `Hey ${authuser?.firstName || "there"
          }, How can I help you?`;

        this.chatHistory.push(new HumanMessage(greeting));
        this.chatHistory.push(new AIMessage(aiReply));

        await saveChat({
          content: greeting,
          messageType: "human",
          ...chatData,
        });
        await saveChat({ content: aiReply, messageType: "ai", ...chatData });
        chats = await getChatFromSummaryId({ ...chatData });
      }
      this.chatHistory = chats.map((chat) =>
        chat.messageType === "human"
          ? new HumanMessage(chat.content)
          : new AIMessage(chat.content)
      );
      const cacheKey = `chat:${payloadValue.source}:${payloadValue.summaryId}:${authuser._id}`;

      let data;

      try {
        const redisData: any = await redis.get(cacheKey);
        data = redisData ? JSON.parse(redisData) : null;
      } catch (e) {
        console.error("Redis read error", e);
        data = null;
      }

      if (!data || data.length === 0) {
        data = chats;
        try {
          await redis.set(cacheKey, JSON.stringify(chats), { EX: 60 * 5 });
        } catch (e) {
          console.error("Redis write error", e);
        }
      }

      res.status(StatusCodes.OK).json({
        message: "Fetched Chat with AI",
        result: data,
        summaryData: summary,
        success: true,
      });
    } catch (error) {
      if (error.isJoi) {
        return res.status(422).json({ message: error.message });
      }
      console.log("error", "error in create chat with ai", error);
      return res.status(500).json({
        message:
          "Something happened wrong try again chat with ai after sometime",
        error: JSON.stringify(error.message),
      });
    }
  };
}
