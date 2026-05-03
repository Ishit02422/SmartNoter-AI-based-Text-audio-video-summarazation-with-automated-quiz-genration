import { Response } from "express";
import { Request } from "../../request";
import Joi from "joi";
import axios from "axios";
import { AssemblyAI } from "assemblyai";
import { getLlm } from "../../llm";
import {
  checkAudioSummaryIsExistById,
  deletedSummary,
  GeneratedSummaryAudio,
  saveGeneratedSummary,
  updateAudioSummary,
} from "../../modules/generatedSummaryFromAudio";
import { BuildRAG } from "../rag";
import { getAudioById } from "../../modules/audio";
import { StatusCodes } from "http-status-codes";
import { deductCreditFromUserAccount } from "../../modules/user/deductCredit";
import { getModelByName, History, saveHistory } from "../../modules/history";
import { Types } from "mongoose";
import { getSummaryFromSouceAndSummaryId } from "../../modules/chatWithAI/getSummaryFromSource";

interface PayloadType {
  audioUrl: string;
  summary_type: string;
  summary_models: string;
  language: string;
  model: string;
}

export class Controller {
  private payload;
  protected readonly generateSummaryAudioSchema = Joi.object().keys({
    summary_type: Joi.string()
      .valid("bullets", "bullets_verbose", "gist", "headline", "paragraph")
      .optional(),

    language: Joi.string().optional().default("en"),
    summary_models: Joi.string()
      .valid("informative", "conversational", "catchy")
      .optional(),
    model: Joi.string().optional(),
    audioUrl: Joi.string()
      .pattern(/^(http:\/\/|https:\/\/|audio).+/)
      .optional()
      .messages({
        "string.pattern.base":
          "Audio URL must start with http://, https://, or audio://",
      }),
    audioURL: Joi.string().optional(),
    fileId: Joi.optional().external(async (v: string) => {
      if (!v) return;
      const file = await getAudioById(v);
      if (!file) {
        throw new Error("File not found");
      }
    }),
  }).or("audioUrl", "audioURL");
  protected readonly generatedSummaryAudioEditScheam: Joi.ObjectSchema =
    Joi.object().keys({
      aiResponse: Joi.string().optional(),
      transcript: Joi.string().optional(),
      summarization: Joi.string().optional(),
      title: Joi.string().optional(),
    });
  protected readonly create = async (req: Request, res: Response) => {
    try {
      const authUser = req.authUser;
      const payloadValue = await this.generateSummaryAudioSchema
        .validateAsync(req.body, { stripUnknown: true });

      this.payload = payloadValue;

      // If audioUrl is missing but fileId is present, fetch it from DB
      if (!this.payload.audioUrl && !this.payload.audioURL && this.payload.fileId) {
        const file = await getAudioById(this.payload.fileId);
        if (file) {
          this.payload.audioUrl = file.audioURL || (file as any).url || (file as any).fileUrl;
        }
      }

      // const audioResp = await this.transcribeAndSummarize();
      // const llm = await getLlm();
      // const result = await llm.invoke(
      //   `give me summary in following language:${this.payload.language} in plain text from this audio transcript: ${audioResp.transcript}`
      // );
      // const savedData = await saveGeneratedSummary({
      //   ...this.payload,
      //   ...audioResp,
      //   summarization: result.content,
      //   userId: authUser._id,
      // });

      const rag = new BuildRAG("audio", this.payload);
      const { docs, retrievalChain } = await rag.createChunksAndVectorStore();
      const transcriptId = docs[0].metadata.id;
      try {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders();
      } catch (error) {
        console.error("Error flushing headers:", error);
        throw new Error("Failed to set headers for SSE");
      }


      const result = await retrievalChain.stream({
        input: `give me transcript, summary and also give title according to summary in ${payloadValue.language} language from audio url given in context`,
      });

      let resultString = "";
      for await (const chunk of result) {
        resultString += chunk.answer || "";
        res.write(`event: answer\n`);
        res.write(`data: ${JSON.stringify(chunk?.answer)}\n\n`);
      }
      let parsed: any = {};
      try {
        const jsonMatch = resultString.match(/\{[\s\S]*\}/);
        const cleanJson = jsonMatch ? jsonMatch[0] : resultString.replace(/```json\n?|\n```/g, "");
        parsed = JSON.parse(cleanJson);
      } catch (e) {
        console.error("JSON Parse Error in Audio Summary:", e);
        parsed = {
          summary: resultString,
          title: "Untitled",
          transcript: ""
        };
      }
      const jsonResult = {
        transcript: parsed.transcript || "",
        summarization: parsed.summary || parsed.summarization || "",
        title: parsed.title || "Untitled",
        userId: authUser._id,
        transcriptId,
        duration: docs[0].metadata.audio_duration || 0,
        aiResponse: resultString,
      };
      const savedData = await saveGeneratedSummary(
        new GeneratedSummaryAudio({
          ...this.payload,
          ...jsonResult,
        })
      );

      await deductCreditFromUserAccount(authUser._id);

      await saveHistory(
        new History({
          modelId: [new Types.ObjectId(savedData._id)],
          modelName: getModelByName.SummaryAudio,
          userId: authUser._id.toString(),
        })
      );

      res.write(`event: metadata\n`);
      res.write(`data: ${JSON.stringify(savedData)}`);

      res.write(`event: done\ndata: {}\n\n`);
      res.end();
      res.end();
    } catch (error: any) {
      if (error.isJoi) {
        return res.status(422).json({ message: error.message });
      }
      console.log("error", "error in create generatedSummary", error);
      if (res.headersSent) {
        if (!res.writableEnded) {
          res.write(`event: error\n`);
          res.write(`data: ${JSON.stringify({ message: error.message || "Streaming error" })}\n\n`);
          res.end();
        }
        return;
      }
      return res.status(500).json({
        message:
          "Something happened wrong try again generatedSummary after sometime",
        error: JSON.stringify(error?.message || error),
      });
    }
  };

  protected readonly createDirect = async (req: Request, res: Response) => {
    try {
      const authUser = req.authUser;
      const payloadValue = await this.generateSummaryAudioSchema
        .validateAsync(req.body, { stripUnknown: true });

      this.payload = payloadValue;

      // If audioUrl is missing but fileId is present, fetch it from DB
      if (!this.payload.audioUrl && !this.payload.audioURL && this.payload.fileId) {
        const file = await getAudioById(this.payload.fileId);
        if (file) {
          this.payload.audioUrl = file.audioURL || (file as any).url || (file as any).fileUrl;
        }
      }

      // const audioResp = await this.transcribeAndSummarize();
      // const llm = await getLlm();
      // const result = await llm.invoke(
      //   `give me summary in following language:${this.payload.language} in plain text from this audio transcript: ${audioResp.transcript}`
      // );
      // const savedData = await saveGeneratedSummary({
      //   ...this.payload,
      //   ...audioResp,
      //   summarization: result.content,
      //   userId: authUser._id,
      // });

      const rag = new BuildRAG("audio", this.payload);
      const { docs, retrievalChain } = await rag.createChunksAndVectorStore();
      const transcriptId = docs[0].metadata.id;

      const result = await retrievalChain.stream({
        input: `give me transcript, summary and also give title according to summary in ${payloadValue.language} language from audio url given in context`,
      });
      let resultString = "";
      for await (const chunk of result) {
        resultString += chunk.answer || "";

      }
      let parsed: any = {};
      try {
        const jsonMatch = resultString.match(/\{[\s\S]*\}/);
        const cleanJson = jsonMatch ? jsonMatch[0] : resultString.replace(/```json\n?|\n```/g, "");
        parsed = JSON.parse(cleanJson);
      } catch (e) {
        console.error("JSON Parse Error in Audio Summary (Direct):", e);
        parsed = {
          summary: resultString,
          title: "Untitled",
          transcript: ""
        };
      }
      const jsonResult = {
        transcript: parsed.transcript || "",
        summarization: parsed.summary || parsed.summarization || "",
        title: parsed.title || "Untitled",
        userId: authUser._id,
        transcriptId,
        duration: docs[0].metadata.audio_duration || 0,
        aiResponse: resultString,
      };
      const savedData = await saveGeneratedSummary(
        new GeneratedSummaryAudio({
          ...this.payload,
          ...jsonResult,
        })
      );
      await deductCreditFromUserAccount(authUser._id);
      await saveHistory(
        new History({
          modelId: [new Types.ObjectId(savedData._id)],
          modelName: getModelByName.SummaryAudio,
          userId: authUser._id.toString(),
        })
      );
      return res.status(200).json({
        result: savedData,
      });
    } catch (error: any) {
      if (error.isJoi) {
        return res.status(422).json({ message: error.message });
      }
      console.log("error", "error in create generatedSummary", error);
      if (res.headersSent) {
        return;
      }
      return res.status(500).json({
        message:
          "Something happened wrong try again generatedSummary after sometime",
        error: JSON.stringify(error?.message || error),
      });
    }
  };
  protected readonly update = async (req: Request, res: Response) => {
    const authUser = req.authUser;
    const summaryId = req.params.id;
    try {
      const payloadValue = await this.generatedSummaryAudioEditScheam
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
      const summary = await checkAudioSummaryIsExistById(
        summaryId,
        authUser._id
      );
      if (!summary) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "Summary not found", success: false });
      }
      const updated = await updateAudioSummary(summaryId, payloadValue);
      return res
        .status(StatusCodes.OK)
        .json({ message: "Summary updated", success: true, result: updated });
    } catch (error) {
      console.error("Error in update generatedSummaryAudio:", error);
      return res.status(500).json({
        message: "Something went wrong, try again later",
        error: error instanceof Error ? error.message : "Unknown error",
      });
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
      if (error.isJoi) {
        return res.status(422).json({ message: error.message });
      }
      console.log("error", "error in delete audio summary", error);
      return res.status(500).json({
        message:
          "Something happened wrong try again delete summary after sometime",
        error: JSON.stringify(error.message),
      });
    }
  };
}
