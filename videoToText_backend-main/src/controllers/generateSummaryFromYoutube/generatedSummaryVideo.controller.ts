import Joi from "joi";
import { Request } from "../../request";
import { Response } from "express";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { CharacterTextSplitter } from "langchain/text_splitter";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { createRetrievalChain } from "langchain/chains/retrieval";
// Removed unused YoutubeLoader import – using youtube-transcript library instead
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { config } from "dotenv";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {
  checkVideoSummaryIsExistById,
  deletedSummary,
  GeneratedSummaryVideo,
  saveGeneratedSummaryFromYoutube,
  updateVideoSummary,
} from "../../modules/generateSummaryFromYoutube";
import { LanguageModelLike } from "@langchain/core/language_models/base";
import { getLlm } from "../../llm";
import { BuildRAG } from "../rag";
import { saveSummaryInFolder } from "../../modules/folders";
import { getFolderById } from "../../modules/folders/getFolderById";
import { checkFolderExistsWithUserId } from "../../modules/folders/checkIfExistFolderWithUserId";
import { StatusCodes } from "http-status-codes";
import { deductCreditAndAddReward } from "../../modules/user";
import axios from "axios";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import Ffmpeg from "fluent-ffmpeg";
import { getVideoById } from "../../modules/video";
import { getModelByName, History, saveHistory } from "../../modules/history";
import { Types } from "mongoose";
import { data } from "cheerio/dist/commonjs/api/attributes";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import { getSummaryFromSouceAndSummaryId } from "../../modules/chatWithAI/getSummaryFromSource";
config();
interface GeneratedSummaryPayload {
  videoUrl: string;
  sourceType: "youtube" | "upload";
  model?: string;
  summary_models?: string;
  summary_types?: string;
  language?: string;
}
Ffmpeg.setFfmpegPath(ffmpegPath.path);
export default class Controller {
  private authUser: any;
  protected readonly generatedSummaryVideoCreateSchema: Joi.ObjectSchema =
    Joi.object().keys({
      videoUrl: Joi.string()
        .pattern(
          /^(https?:\/\/)?([a-zA-Z0-9-]+\.)?(youtube\.com|youtu\.be)\/.+$/
        )
        .required()
        .messages({
          "string.pattern.base": "Video URL must be a valid YouTube link.",
          "string.empty": "Video URL is required.",
        }),
      model: Joi.string().optional(),
      summary_models: Joi.string()
        .valid("informative", "conversational", "catchy")
        .optional(),
      // folderId: Joi.string().external(async (v: string) => {
      //   let id;
      //   if (v) {
      //     id = await getFolderById(v, this.authUser._id);
      //   } else {
      //     id = await checkFolderExistsWithUserId(
      //       this.authUser._id,
      //       "All Notes"
      //     );
      //   }
      //   return id;
      // }),
      summary_types: Joi.string()
        .valid("bullets", "bullets_verbose", "gist", "headline", "paragraph")
        .optional(),
      language: Joi.string()
        .pattern(/^[a-z]{2}$/i)
        .optional()
        .default("en")
        .label("Language Code"),
    });
  protected readonly generatedSummaryVideoEditScheam: Joi.ObjectSchema =
    Joi.object().keys({
      aiResponse: Joi.string().optional(),
      transcript: Joi.string().optional(),
      summarization: Joi.string().optional(),
      language: Joi.string().optional(),
      title: Joi.string().optional(),
    });
  protected readonly generatedSummaryUploadedVideoCreateSchema: Joi.ObjectSchema =
    Joi.object().keys({
      videoUrl: Joi.string()
        // .custom((v: string) => {
        //   if (!v) return;
        //   if (!v.startsWith("video")) throw new Error("Invalid Video Url");
        //   return `${process.env.BASE_URL}/${v}`;
        // })
        .required(),
      fileId: Joi.string()
        .external(async (v: string) => {
          if (!v) return;
          const file = await getVideoById(v);
          if (!file) {
            throw new Error("Video not found");
          }
        })
        .required(),
      language: Joi.string().optional().default("English"),
    });
  // Extract video ID from YouTube URL
  private async extractVideoIdFromLink(url: string): Promise<string | null> {
    const regex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  protected readonly create = async (req: Request, res: Response) => {
    try {
      const authUser = req.authUser;
      this.authUser = authUser;
      const payloadValue =
        await this.generatedSummaryVideoCreateSchema.validateAsync(req.body, {
          stripUnknown: true,
        });

      const videoId = await this.extractVideoIdFromLink(payloadValue.videoUrl);
      if (!videoId) {
        return res.status(400).json({
          message: "Invalid or missing YouTube video ID",
          success: false,
        });
      }

      const rag = new BuildRAG("youtube", payloadValue);
      const { docs, retrievalChain } = await rag.createChunksAndVectorStore();
      const result = await retrievalChain.stream({
        input: `give me transcript and summary in ${payloadValue.language} language from youtube video url given in context`,
      });

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders();
      let resultString = "";
      for await (const chunk of result) {
        resultString += chunk?.answer || "";
        res.write(`event: answer\n`);
        res.write(`data: ${JSON.stringify(chunk?.answer)}\n\n`);
      }

      let parsed: any = {};
      try {
        const jsonMatch = resultString.match(/\{[\s\S]*\}/);
        const cleanJson = jsonMatch ? jsonMatch[0] : resultString.replace(/```json\n?|\n```/g, "");
        parsed = JSON.parse(cleanJson);
      } catch (e) {
        console.error("JSON Parse Error in Video Summary:", e);
        // Fallback for non-JSON responses
        parsed = {
          summary: resultString,
          title: docs?.[0]?.metadata?.title || "Untitled",
          transcript: "Transcript failed to parse or available in raw text",
        };
      }

      const restData = {
        title: parsed?.topic || parsed?.title || docs[0]?.metadata?.title || "Untitled",
        videoId,
        summarization: parsed?.summarization || parsed?.summary || "Summary could not be generated",
        transcript: parsed?.transcript || (docs?.[0] ? docs[0].pageContent : "Transcript not available"),
        userId: authUser._id,
        language: payloadValue.language,
        sourceType: "youtube",
      };

      //store data in db
      const savedData = await saveGeneratedSummaryFromYoutube(
        new GeneratedSummaryVideo({
          ...payloadValue,
          ...restData,

          aiResponse: JSON.stringify(parsed),
        })
      );
      const { aiResponse, ...dbData } = savedData;

      //send response in streams
      await deductCreditAndAddReward(authUser._id, "VIDEO_SUMMARY");
      await saveHistory(
        new History({
          modelId: [new Types.ObjectId(savedData._id)],
          modelName: getModelByName.SummaryVideo,
          userId: authUser._id.toString(),
        })
      );
      res.write(`event: metadata\n`);
      res.write(
        `data: ${JSON.stringify({
          dbData,
        })}\n\n`
      );

      // Final signal to close
      res.write(`event: done\ndata: {}\n\n`);
      res.end();

      // return res.status(200).json({
      //   videoId,
      //   result,
      //   metadata: docs?.[0]?.metadata,
      //   language: payloadValue.language || "en",
      // });
    } catch (error: any) {
      if (error.isJoi) {
        if (res.headersSent) {
          if (!res.writableEnded) {
            res.write(`event: error\n`);
            res.write(`data: ${JSON.stringify({ message: error.message })}\n\n`);
            res.end();
          }
          return;
        }
        return res.status(422).json({ message: error.message });
      }
      console.error("FULL ERROR IN CREATE:", error);
      if (res.headersSent) {
        if (!res.writableEnded) {
          res.write(`event: error\n`);
          res.write(`data: ${JSON.stringify({ message: error.message || "Streaming error" })}\n\n`);
          res.end();
        }
        return;
      }
      return res.status(500).json({
        message: error.message || "Failed to generate summary",
        error: error.stack || error.message || "Unknown error",
      });
    }
  };
  protected readonly createDirect = async (req: Request, res: Response) => {
    try {
      const authUser = req.authUser;
      this.authUser = authUser;
      const payloadValue =
        await this.generatedSummaryVideoCreateSchema.validateAsync(req.body, {
          stripUnknown: true,
        });

      const videoId = await this.extractVideoIdFromLink(payloadValue.videoUrl);
      if (!videoId) {
        return res.status(400).json({
          message: "Invalid or missing YouTube video ID",
          success: false,
        });
      }

      const rag = new BuildRAG("youtube", payloadValue);
      const { docs, retrievalChain } = await rag.createChunksAndVectorStore();
      const result = await retrievalChain.stream({
        input: `give me transcript and summary in ${payloadValue.language} language from youtube video url given in context`,
      });

      let resultString = "";
      for await (const chunk of result) {
        console.log(chunk.answer);
        resultString += chunk?.answer || "";
      }
      let parsed: any = {};
      try {
        const jsonMatch = resultString.match(/\{[\s\S]*\}/);
        const cleanJson = jsonMatch ? jsonMatch[0] : resultString.replace(/```json\n?|\n```/g, "");
        parsed = JSON.parse(cleanJson);
      } catch (e) {
        console.error("JSON parse failed in createDirect:", e);
        // Fallback or handle error
        parsed = {
          summary: resultString,
          title: docs?.[0]?.metadata?.title || "Untitled",
          transcript: "Transcript failed to parse or available in raw text",
        };
      }

      const restData = {
        title: parsed?.topic || parsed?.title || docs[0]?.metadata?.title || "Untitled",
        videoId,
        summarization: parsed?.summarization || parsed?.summary || "Summary could not be generated",
        transcript: parsed?.transcript || (docs?.[0] ? docs[0].pageContent : "Transcript not available"),
        userId: authUser._id,
        language: payloadValue.language,
        sourceType: "youtube",
      };

      //store data in db
      const savedData = await saveGeneratedSummaryFromYoutube(
        new GeneratedSummaryVideo({
          ...payloadValue,
          ...restData,
          aiResponse: JSON.stringify(parsed),
        })
      );

      //send response in streams
      await deductCreditAndAddReward(authUser._id, "VIDEO_SUMMARY");
      await saveHistory(
        new History({
          modelId: [new Types.ObjectId(savedData._id)],
          modelName: getModelByName.SummaryVideo,
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
      console.error("FULL ERROR IN CREATE DIRECT:", error);

      const statusCode = error.message.includes("credits") ? 402 : 500;
      return res.status(statusCode).json({
        message: error.message || "Failed to generate summary",
        error: error.stack || error.message || "Unknown internal error",
        success: false
      });
    }
  };




  protected readonly update = async (req: Request, res: Response) => {
    const authUser = req.authUser;
    const summaryId = req.params.id;
    try {
      const payloadValue = await this.generatedSummaryVideoEditScheam
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

      const summary = await checkVideoSummaryIsExistById(
        summaryId,
        authUser._id
      );
      if (!summary) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "Summary not found", success: false });
      }
      const updated = await updateVideoSummary(summaryId, payloadValue);
      return res
        .status(StatusCodes.OK)
        .json({ message: "Summary updated", success: true, result: updated });
    } catch (error) {
      console.error("Error in update generatedSummaryVideo:", error);
      return res.status(500).json({
        message: "Something went wrong, try again later",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  private downloadVideo = async (url: string) => {
    const fileName = `video-${uuidv4()}.mkv`;
    const videopath = path.join(__dirname, fileName);

    const response = await axios({
      url,
      method: "GET",
      responseType: "stream",
    });
    const writer = fs.createWriteStream(videopath);

    return new Promise<string>((resolve, reject) => {
      response.data.pipe(writer);
      writer.on("finish", () => resolve(videopath));
      writer.on("error", () => {
        fs.unlink(videopath, (err) => {
          if (err) throw new Error(err.message);
        });
        reject;
      });
    });
  };

  private readonly extractAudio = async (videoPath, audioPath) =>
    new Promise((resolve, reject) => {
      Ffmpeg(videoPath)
        .noVideo()
        .audioCodec("libmp3lame")
        .save(audioPath)
        .on("end", resolve)
        .on("error", reject);
    });

  protected readonly uploadedVideo = async (req: Request, res: Response) => {
    let videopath: string;
    let audiopath: string;
    try {
      const authUser = req.authUser;
      this.authUser = authUser;
      const payloadValue =
        await this.generatedSummaryUploadedVideoCreateSchema.validateAsync(
          req.body,
          {
            stripUnknown: true,
          }
        );
      videopath = await this.downloadVideo(
        `${process.env.BASE_URL}/${payloadValue.videoUrl}`
      );

      const fileName = `audio-${uuidv4()}.wav`;
      audiopath = path.join(__dirname, fileName);
      await this.extractAudio(videopath, audiopath);

      const rag = new BuildRAG("uploadvideo", { audioUrl: audiopath });
      const { docs, retrievalChain } = await rag.createChunksAndVectorStore();

      const result = await retrievalChain.stream({
        input: `give me transcript, summary and title in ${payloadValue.language} language from youtube video url given in context`,
      });
      let resultString = "";
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders();
      for await (const chunk of result) {
        resultString += chunk?.answer || "";
        res.write(`event: answer\n`);
        res.write(`data: ${JSON.stringify(chunk?.answer)}\n\n`);
      }
      let parsed: any = {};
      try {
        const jsonMatch = resultString.match(/\{[\s\S]*\}/);
        const cleanJson = jsonMatch ? jsonMatch[0] : resultString.replace(/```json\n?|\n```/g, "");
        parsed = JSON.parse(cleanJson);
      } catch (e) {
        console.error("JSON parse failed in uploadedVideo:", e);
        parsed = {
          summary: resultString,
          title: "Untitled",
          transcript: "Transcript failed to parse or available in raw text",
        };
      }

      const restData = {
        title: parsed?.topic || parsed?.title || "Untitled",
        summarization: parsed?.summarization || parsed?.summary || "Summary could not be generated",
        transcript: parsed?.transcript || (docs?.[0] ? docs[0].pageContent : "Transcript not available"),
        userId: authUser._id,
        videoId: "",
        aiResponse: JSON.stringify(parsed),
        sourceType: "upload",
        language: payloadValue.language || "English",
      };

      // //store data in db
      const savedData = await saveGeneratedSummaryFromYoutube(
        new GeneratedSummaryVideo({
          ...payloadValue,
          ...restData,
        })
      );

      await deductCreditAndAddReward(authUser._id, "VIDEO_SUMMARY");
      // //send response in streams
      res.write(`event: metadata\n`);
      res.write(
        `data: ${JSON.stringify({
          resultData: savedData,
        })}\n\n`
      );

      // // Final signal to close
      res.write(`event: done\ndata: {}\n\n`);
      res.end();
    } catch (error: any) {
      if (error.isJoi) {
        if (res.headersSent) {
          if (!res.writableEnded) {
            res.write(`event: error\n`);
            res.write(`data: ${JSON.stringify({ message: error.message })}\n\n`);
            res.end();
          }
          return;
        }
        return res.status(422).json({ message: error.message });
      }
      console.log("error", "error in generate upload video summary", error);
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
          "Something happened wrong try again generate summary after sometime",
        error: JSON.stringify(error.message),
      });
    } finally {
      fs.unlink(videopath, (err) => {
        if (err) return new Error(err.message);
        return;
      });
      fs.unlink(audiopath, (err) => {
        if (err) return new Error(err.message);
        return;
      });
    }
  };

  protected readonly uploadedVideoDirect = async (
    req: Request,
    res: Response
  ) => {
    let videopath: string;
    let audiopath: string;
    try {
      const authUser = req.authUser;
      this.authUser = authUser;
      const payloadValue =
        await this.generatedSummaryUploadedVideoCreateSchema.validateAsync(
          req.body,
          {
            stripUnknown: true,
          }
        );
      videopath = await this.downloadVideo(
        `${process.env.BASE_URL}/${payloadValue.videoUrl}`
      );

      const fileName = `audio-${uuidv4()}.wav`;
      audiopath = path.join(__dirname, fileName);
      await this.extractAudio(videopath, audiopath);

      const rag = new BuildRAG("uploadvideo", { audioUrl: audiopath });
      const { docs, retrievalChain } = await rag.createChunksAndVectorStore();

      const result = await retrievalChain.stream({
        input: `give me transcript, summary and title in ${payloadValue.language} language from youtube video url given in context`,
      });
      let resultString = "";

      for await (const chunk of result) {
        resultString += chunk?.answer || "";
      }
      let parsed: any = {};
      try {
        const jsonMatch = resultString.match(/\{[\s\S]*\}/);
        const cleanJson = jsonMatch ? jsonMatch[0] : resultString.replace(/```json\n?|\n```/g, "");
        parsed = JSON.parse(cleanJson);
      } catch (e) {
        console.error("JSON parse failed in uploadedVideoDirect:", e);
        parsed = {
          summary: resultString,
          title: "Untitled",
          transcript: "Transcript failed to parse or available in raw text",
        };
      }

      const restData = {
        title: parsed?.topic || parsed?.title || "Untitled",
        summarization: parsed?.summarization || parsed?.summary || "Summary could not be generated",
        transcript: parsed?.transcript || (docs?.[0] ? docs[0].pageContent : "Transcript not available"),
        userId: authUser._id,
        videoId: "",
        aiResponse: JSON.stringify(parsed),
        sourceType: "upload",
        language: payloadValue.language || "English",
      };

      // //store data in db
      const savedData = await saveGeneratedSummaryFromYoutube(
        new GeneratedSummaryVideo({
          ...payloadValue,
          ...restData,
        })
      );

      await deductCreditAndAddReward(authUser._id, "VIDEO_SUMMARY");
      // //send response in streams

      return res.status(StatusCodes.OK).json({ result: savedData });
    } catch (error: any) {
      if (error.isJoi) {
        return res.status(422).json({ message: error.message });
      }
      console.log("error", "error in generate upload video summary", error);
      return res.status(500).json({
        message:
          "Something happened wrong try again generate summary after sometime",
        error: JSON.stringify(error.message),
      });
    } finally {
      if (videopath) {
        fs.unlink(videopath, (err) => {
          if (err) console.error("Error unlinking videopath:", err.message);
        });
      }
      if (audiopath) {
        fs.unlink(audiopath, (err) => {
          if (err) console.error("Error unlinking audiopath:", err.message);
        });
      }
    }
  };
  protected readonly delete = async (req: Request, res: Response) => {
    const authUser = req.authUser;
    const summaryId = req.params.id;
    const source = req.query.source;
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
      await deletedSummary(summary._id);
      return res
        .status(StatusCodes.OK)
        .json({ message: "Summary Deleted", success: true });
    } catch (error) {
      if (error.isJoi) {
        return res.status(422).json({ message: error.message });
      }
      console.log("error", "error in delete video summary", error);
      return res.status(500).json({
        message:
          "Something happened wrong try again delete summary after sometime",
        error: JSON.stringify(error.message),
      });
    }
  };
}
