import { Response } from "express";
import { Request } from "../../request";
import { getLlm } from "../../llm";
import { LanguageModelLike } from "@langchain/core/language_models/base";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { getSummaryFromSouceAndSummaryId } from "../../modules/chatWithAI/getSummaryFromSource";
import Joi from "joi";
import { StatusCodes } from "http-status-codes";
import { getFlashCard, saveFlashCard } from "../../modules/flashcard";
import { FlashCard, IFlashCard } from "../../modules/flashcard/types";
import { deductCreditFromUserAccount } from "../../modules/user/deductCredit";
import {
  getModelByName,
  History,
  modelNames,
  saveHistory,
} from "../../modules/history";
import axios from "axios";

export default class Controller {
  private llm: LanguageModelLike;
  private createFlashCardSchema = Joi.object().keys({
    source: Joi.string()
      .valid("pdf", "video", "audio", "web", "text")
      .required(),
    summaryId: Joi.string().required(),
  });

  private readonly generateImage = async (que: string) => {
    try {
      if (!process.env.UNSPLASH_ACCESS_KEY || process.env.UNSPLASH_ACCESS_KEY === 'undefined') {
        console.warn("UNSPLASH_ACCESS_KEY is missing. Skipping image generation.");
        return null;
      }

      const res = await axios.get(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(que)}&client_id=${process.env.UNSPLASH_ACCESS_KEY}`,
        { timeout: 5000 } // Add timeout to prevent hanging
      );

      if (res.data && res.data.results && res.data.results.length > 0) {
        return res.data.results[0].urls?.regular || res.data.results[0].urls?.full;
      }
      return null;
    } catch (error) {
      console.error("Error generating image from Unsplash:", error.message);
      return null; // Return null instead of throwing to avoid breaking the whole flow
    }
  };
  protected readonly create = async (req: Request, res: Response) => {
    const authUser = req.authUser;
    try {
      const payloadValue = await this.createFlashCardSchema.validateAsync(
        req.body,
        {
          stripUnknown: true,
        }
      );
      this.llm = await getLlm();
      const summary = await getSummaryFromSouceAndSummaryId(
        payloadValue.source,
        payloadValue.summaryId,
        authUser._id
      );
      if (!summary) {
        return res
          .status(StatusCodes.NOT_FOUND)
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
      const systemPrompt = ChatPromptTemplate.fromTemplate(prompt).pipe(
        this.llm
      );
      const contextStr = JSON.stringify({
        summary: summary?.summarization || summary?.summary,
        transcript: summary?.transcript,
        actionPoints: summary?.actionPoints,
        keyPoints: summary?.keyPoints,
      });

      const result = await systemPrompt.invoke({ context: contextStr });

      let content: string;
      if (typeof result === "string") {
        content = result;
      } else if (result && typeof result === "object" && "content" in result) {
        content = (result as any).content;
      } else {
        throw new Error("Unexpected result type from systemPrompt.invoke");
      }
      let parsed: any = [];
      try {
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        const cleanJson = jsonMatch ? jsonMatch[0] : content.replace(/```json\n?|\n```/g, "").trim();
        parsed = JSON.parse(cleanJson);
      } catch (e) {
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
        const que = value?.Q || "N/A";
        const url = await this.generateImage(que);
        storedData.push({
          ...commonData,
          que: value.Q,
          ans: value.A,
          imageUrl: url,
        });
      }

      const data: IFlashCard = await saveFlashCard(storedData);

      await deductCreditFromUserAccount(authUser._id);
      const modelIds = Array.isArray(data)
        ? data.map((card) => card._id)
        : [data._id];
      await saveHistory(
        new History({
          modelId: modelIds,
          modelName: getModelByName.FlashCard,
          userId: authUser._id.toString(),
        })
      );
      return res.status(StatusCodes.OK).json({
        message: "Flash Card Generated",
        success: true,
        result: { summary, flashcards: data },
      });
    } catch (error: any) {
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

  protected readonly getAllFlashCards = async (req: Request, res: Response) => {
    const authUser = req.authUser;
    try {
      const payloadValue = await this.createFlashCardSchema.validateAsync(
        req.body,
        {
          stripUnknown: true,
        }
      );

      const summary = await getSummaryFromSouceAndSummaryId(
        payloadValue.source,
        payloadValue.summaryId,
        authUser._id
      );
      const cards = await getFlashCard(
        payloadValue.source,
        payloadValue.summaryId,
        authUser._id
      );
      return res.status(StatusCodes.OK).json({
        message: "Flash Card Fetched",
        success: true,
        result: { flashcards: cards, summary },
      });
    } catch (error) {
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
