import { Response } from "express";
import { Request } from "../../request";
import Joi from "joi";

import { BuildRAG } from "../rag";
import { getAudioById } from "../../modules/audio";
import { StatusCodes } from "http-status-codes";
import { deductCreditFromUserAccount } from "../../modules/user/deductCredit";
import { getModelByName, History, saveHistory } from "../../modules/history";
import { getLlm } from "../../llm";
import { PromptTemplate } from "@langchain/core/prompts";
import {
  checkTextSummaryIsExistById,
  deletedSummary,
  GenerateSummaryText,
  saveGeneratedSummaryFromText,
  updateTextSummary,
} from "../../modules/generateSummaryFromText";
import { getSummaryFromSouceAndSummaryId } from "../../modules/chatWithAI/getSummaryFromSource";

export class Controller {
  private payload;
  protected readonly generateSummaryTextSchema = Joi.object().keys({
    language: Joi.string().optional().default("en"),
    text: Joi.string()
      .required()
      .replace(/['"]/g, ""),
  });
  protected readonly generatedSummaryTextEditScheam: Joi.ObjectSchema =
    Joi.object().keys({
      actionPoints: Joi.array().optional(),
      keyPoints: Joi.array().optional(),
      summarization: Joi.string().optional(),
      title: Joi.string().optional(),
    });

  private getLanguageName(code: string): string {
    const mapping: Record<string, string> = {
      en: "English",
      hi: "Hindi",
      gu: "Gujarati",
      es: "Spanish",
      fr: "French",
      de: "German",
    };
    return mapping[code.toLowerCase()] || code;
  }

  protected readonly create = async (req: Request, res: Response) => {
    try {
      const authUser = req.authUser;
      const payloadValue = await this.generateSummaryTextSchema
        .validateAsync(req.body)
        .catch((e: unknown) => {
          if (e instanceof Error) {
            return res.status(422).json({ message: e.message });
          }
          return res.status(422).json({ message: "Invalid payload" });
        });
      if (!payloadValue) {
        return res.status(422).json({ message: "Invalid payload" });
      }
      this.payload = req.body;

      let llm = await getLlm();
      const lang = this.getLanguageName(payloadValue.language || "en");

      const prompt = PromptTemplate.fromTemplate(
        `
You are an intelligent AI assistant that extracts a concise and meaningful summary from the given text.

Instructions:
- The output language must be ${lang}.
- Analyze the text and generate a clean, simple, and accurate summary paragraph in ${lang}.
- The final result must be a JSON object containing ONLY two fields: "summary" (a string containing the summarized text) and "title" (a string in ${lang}).
- Do NOT generate action points or key points. Just a plain summary paragraph.
- Do NOT add any extra explanation or text outside the JSON.

Context: {context}
`
      ).pipe(llm);

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      // @ts-ignore
      if (res.flushHeaders) res.flushHeaders();

      const result = await (prompt as any).stream({ 
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
      let parsed: any = {};
      try {
        const jsonMatch = resultString.match(/\{[\s\S]*\}/);
        const cleanJson = jsonMatch ? jsonMatch[0] : resultString.replace(/```json\n?|\n```/g, "");
        parsed = JSON.parse(cleanJson);
      } catch (e) {
        console.error("JSON Parse Error in Text Summary:", e);
        parsed = {
          summary: resultString,
          title: "Untitled",
        };
      }

      let summaryText = parsed.summary;
      if (Array.isArray(summaryText)) {
        summaryText = summaryText.join("\n");
      } else if (typeof summaryText === "object" && summaryText !== null) {
        summaryText = JSON.stringify(summaryText);
      } else if (typeof summaryText !== "string") {
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
      const savedData = await saveGeneratedSummaryFromText(
        new GenerateSummaryText({
          ...payloadValue,
          ...jsonResult,
        })
      );
      await deductCreditFromUserAccount(authUser._id);
      await saveHistory(
        new History({
          modelId: [savedData._id],
          modelName: getModelByName.SummaryText,
          userId: authUser._id.toString(),
        })
      );
      res.write(`event: metadata\n`);
      res.write(`data: ${JSON.stringify(savedData)}\n\n`);

      res.write(`event: done\ndata: {}\n\n`);
      res.end();
    } catch (error: any) {
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

  protected readonly createDirect = async (req: Request, res: Response) => {
    try {
      const authUser = req.authUser;
      const payloadValue = await this.generateSummaryTextSchema
        .validateAsync(req.body)
        .catch((e: unknown) => {
          if (e instanceof Error) {
            return res.status(422).json({ message: e.message });
          }
          return res.status(422).json({ message: "Invalid payload" });
        });
      if (!payloadValue) {
        return res.status(422).json({ message: "Invalid payload" });
      }
      this.payload = req.body;

      let llm = await getLlm();
      const lang = this.getLanguageName(payloadValue.language || "en");

      const prompt = PromptTemplate.fromTemplate(
        `
You are an intelligent AI assistant that extracts a concise and meaningful summary from the given text.

Instructions:
- The output language must be ${lang}.
- Analyze the text and generate a clean, simple, and accurate summary paragraph in ${lang}.
- The final result must be a JSON object containing ONLY two fields: "summary" (a string containing the summarized text) and "title" (a string in ${lang}).
- Do NOT generate action points or key points. Just a plain summary paragraph.
- Do NOT add any extra explanation or text outside the JSON.

Context: {context}
`
      ).pipe(llm);

      const result = await prompt.invoke({ 
        context: payloadValue.text,
        language: payloadValue.language 
      });

      const resultString = String((result as any).content || "");
      let parsed: any = {};
      try {
        const jsonMatch = resultString.match(/\{[\s\S]*\}/);
        const cleanJson = jsonMatch ? jsonMatch[0] : resultString.replace(/```json\n?|\n```/g, "");
        parsed = JSON.parse(cleanJson);
      } catch (e) {
        console.error("JSON Parse Error in Text Summary (Direct):", e);
        parsed = {
          summary: resultString,
          title: "Untitled",
        };
      }

      let summaryText = parsed.summary;
      if (Array.isArray(summaryText)) {
        summaryText = summaryText.join("\n");
      } else if (typeof summaryText === "object" && summaryText !== null) {
        summaryText = JSON.stringify(summaryText);
      } else if (typeof summaryText !== "string") {
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
      const savedData = await saveGeneratedSummaryFromText(
        new GenerateSummaryText({
          ...payloadValue,
          ...jsonResult,
        })
      );
      await deductCreditFromUserAccount(authUser._id);
      await saveHistory(
        new History({
          modelId: [savedData._id],
          modelName: getModelByName.SummaryText,
          userId: authUser._id.toString(),
        })
      );
      return res.status(200).json({
        result: savedData,
      });
    } catch (error: any) {
      console.log("error", "error in create generatedSummary", error);
      return res.status(500).json({
        message: `Error: ${error.message || "Something went wrong"}`,
        error: error.stack || error.message || JSON.stringify(error),
      });
    }
  };

  protected readonly update = async (req: Request, res: Response) => {
    const authUser = req.authUser;
    const summaryId = req.params.id;
    try {
      const payloadValue = await this.generatedSummaryTextEditScheam
        .validateAsync(req.body)
        .catch((e: unknown) => {
          if (e instanceof Error) {
            return res.status(422).json({ message: e.message });
          }
          return res.status(422).json({ message: "Invalid payload" });
        });

      if (!payloadValue) {
        return res.status(422).json({ message: "Invalid payload" });
      }
      const summary = await checkTextSummaryIsExistById(
        summaryId,
        authUser._id
      );
      if (!summary) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "Summary not found", success: false });
      }
      const updated = await updateTextSummary(summaryId, payloadValue);
      return res
        .status(StatusCodes.OK)
        .json({ message: "Summary updated", success: true, result: updated });
    } catch (error) {
      let errorMessage = "An error occurred";
      let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;

      if (error && (error as any).isJoi) {
        errorMessage = (error as any).message;
        statusCode = StatusCodes.UNPROCESSABLE_ENTITY;
      } else {
        console.log("error", "error in generate summary from text", error);
        errorMessage =
          (error as any).message || "Something went wrong, please try again";
      }
      return res
        .status(statusCode)
        .json({ success: false, message: errorMessage });
    }
  };

  protected readonly delete = async (req: Request, res: Response) => {
    const authUser = req.authUser;
    const summaryId = req.params.id;
    const source = req.query.source
    if (!source) {
      return res.status(400).json({ message: "Source is required" });

    }
    try {
      const summary = await getSummaryFromSouceAndSummaryId(
        source as string,
        summaryId,
        authUser._id
      );
      if (!summary) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "Summary not found", success: false });
      }
      await deletedSummary(summary._id)
      return res
        .status(StatusCodes.OK)
        .json({ message: "Summary Deleted", success: true });
    } catch (error) {
      if (error && (error as any).isJoi) {
        return res.status(422).json({ message: (error as any).message });
      }
      console.log("error", "error in delete text summary", error);
      return res.status(500).json({
        message:
          "Something happened wrong try again delete summary after sometime",
        error: JSON.stringify((error as any).message),
      });
    }
  };
}
