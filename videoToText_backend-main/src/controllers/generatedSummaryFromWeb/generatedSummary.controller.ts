import { Response } from "express";
import { Request } from "../../request";
import Joi, { isError } from "joi";
import { BuildRAG } from "../rag";
import { StatusCodes } from "http-status-codes";
import { getLlm } from "../../llm";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import {
  checkWebSummaryIsExistById,
  deletedSummary,
  GeneratedSummaryFromWeb,
  saveGeneratedSummaryFromWeb,
} from "../../modules/generatedSummaryFromWeb";
import { deductCreditFromUserAccount } from "../../modules/user/deductCredit";
import { Types } from "mongoose";
import { getModelByName, History, saveHistory } from "../../modules/history";
import {
  checkFolderExistsWithUserId,
  getFolderById,
} from "../../modules/folders";
import { updateWebSummary } from "../../modules/generatedSummaryFromWeb/updateWebSummary";
import { getSummaryFromSouceAndSummaryId } from "../../modules/chatWithAI/getSummaryFromSource";

export default class Controller {
  private createSummarySchema = Joi.object().keys({
    url: Joi.string().required(),
  });
  private updateSchema = Joi.object().keys({
    summarization: Joi.string().optional(),
    topic: Joi.string().optional(),
    details: Joi.string().optional(),
    actionPoints: Joi.array().optional(),
    keyPoints: Joi.array().optional(),
    tags: Joi.array().optional(),
    title: Joi.string().optional(),
    folderId: Joi.string()
      .external(async (v: string) => {
        if (!v) return;
        const isExist = await getFolderById(v);
        if (!isExist) throw new Error("Folder is not exists");
        return v;
      })
      .optional(),
    quotes: Joi.array().optional(),
  });

  protected readonly create = async (req: Request, res: Response) => {
    // Set up SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders(); // Ensure headers are sent immediately

    // Function to send SSE events
    const sendEvent = (eventName: string, data: any) => {
      res.write(`event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    try {
      const authUser = req.authUser;
      // Validate input
      sendEvent("progress", { message: "Validating URL..." });
      const payloadValue = await this.createSummarySchema
        .validateAsync(req.body)
        .catch((e) => {
          if (isError(e)) {
            throw new Error(e.message);
          } else {
            throw new Error(e.message);
          }
        });

      if (!payloadValue.url.startsWith("http")) {
        throw new Error("Invalid URL. Must start with http:// or https://");
      }

      // Initialize BuildRAG
      sendEvent("progress", { message: "Fetching and analyzing web content..." });
      const rag = new BuildRAG("web", payloadValue);
      const { docs, retrievalChain } = await rag.createChunksAndVectorStore();

      sendEvent("progress", { message: "Generating summary..." });
      const result = await retrievalChain.stream({
        input: `Analyze the web page content and provide a comprehensive summary. Return ONLY a valid JSON object (no markdown, no code blocks, no extra text) with these exact fields:
{
  "topic": "A concise title for this content",
  "summarization": "A detailed, well-structured summary paragraph of the content",
  "keypoints": ["key point 1", "key point 2", "key point 3"],
  "actionpoints": ["action item 1", "action item 2"],
  "details": "Additional in-depth details about the content",
  "quotes": ["notable quote 1", "notable quote 2"],
  "tags": ["tag1", "tag2", "tag3"]
}
IMPORTANT: Return ONLY the JSON object. No markdown formatting, no backticks, no explanation before or after.`,
      });

      let resultString = "";
      for await (const chunk of result) {
        resultString += chunk?.answer || "";
        res.write(`event: answer\ndata: ${JSON.stringify(chunk?.answer)}\n\n`);
      }

      console.log("Web Summary Streaming Response (first 500 chars):", resultString.substring(0, 500));

      let parsed: any = {};
      try {
        // Strategy 1: Try direct parse
        parsed = JSON.parse(resultString.trim());
      } catch (e1) {
        try {
          // Strategy 2: Remove markdown code blocks and parse
          const cleaned = resultString
            .replace(/^```(?:json)?\s*\n?/gm, "")
            .replace(/\n?```\s*$/gm, "")
            .trim();
          parsed = JSON.parse(cleaned);
        } catch (e2) {
          try {
            // Strategy 3: Extract JSON object using balanced brace matching
            const startIdx = resultString.indexOf("{");
            if (startIdx !== -1) {
              let depth = 0;
              let endIdx = startIdx;
              for (let i = startIdx; i < resultString.length; i++) {
                if (resultString[i] === "{") depth++;
                else if (resultString[i] === "}") {
                  depth--;
                  if (depth === 0) { endIdx = i; break; }
                }
              }
              const jsonStr = resultString.substring(startIdx, endIdx + 1);
              parsed = JSON.parse(jsonStr);
            } else {
              throw new Error("No JSON object found in response");
            }
          } catch (e3) {
            console.error("All JSON parse strategies failed for Web Summary (Streaming):", e3);
            // Final fallback: treat the entire response as a plain-text summary
            // Clean up any JSON-like artifacts for display
            const cleanText = resultString
              .replace(/^```(?:json)?\s*\n?/gm, "")
              .replace(/\n?```\s*$/gm, "")
              .replace(/^\s*\{/, "")
              .replace(/\}\s*$/, "")
              .replace(/"(topic|summarization|keypoints|actionpoints|details|quotes|tags)"\s*:\s*/gi, "")
              .trim();
            parsed = {
              summarization: cleanText || resultString,
              topic: "Web Page Summary",
              keypoints: [],
              actionpoints: [],
              details: "",
              quotes: [],
              tags: []
            };
          }
        }
      }

      // Save summary
      sendEvent("progress", { message: "Saving summary..." });
      const summary = await saveGeneratedSummaryFromWeb(
        new GeneratedSummaryFromWeb({
          url: payloadValue.url,
          actionPoints: parsed.actionpoints || parsed.actionPoints || [],
          details: parsed.details || "",
          aiResponse: JSON.stringify(parsed),
          quotes: parsed.quotes || [],
          tags: parsed.tags || [],
          keyPoints: parsed.keypoints || parsed.keyPoints || [],
          summarization: parsed.summarization || parsed.summary || "",
          userId: authUser._id as Types.ObjectId,
          topic: parsed.topic || parsed.title || "",
        })
      );

      // Deduct credit
      sendEvent("progress", { message: "Updating user account..." });
      await deductCreditFromUserAccount(authUser._id);
      await saveHistory(
        new History({
          modelId: [summary._id],
          modelName: getModelByName.SummaryWeb,
          userId: authUser._id.toString(),
        })
      );

      // Send final metadata
      res.write(`event: metadata\ndata: ${JSON.stringify(summary)}\n\n`);

      // Close the connection
      sendEvent("done", { message: "Processing complete" });
      res.end();
    } catch (error: any) {
      console.error("Error in generate summary from web:", error);
      let errorMessage = error.message || "Something went wrong, please try again";
      let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;

      if (error.isJoi) {
        statusCode = StatusCodes.UNPROCESSABLE_ENTITY;
      }

      if (res.headersSent) {
        if (!res.writableEnded) {
          sendEvent("error", { message: errorMessage, status: statusCode });
          res.end();
        }
        return;
      }

      return res.status(statusCode).json({ message: errorMessage });
    }
  };

  protected readonly createDirect = async (req: Request, res: Response) => {
    try {
      const authUser = req.authUser;
      // Validate input
      const payloadValue = await this.createSummarySchema.validateAsync(
        req.body,
        { stripUnknown: true }
      );

      if (!payloadValue.url.startsWith("http")) {
        throw new Error("Invalid URL. Must start with http:// or https://");
      }

      // Initialize BuildRAG
      const rag = new BuildRAG("web", payloadValue);
      const { docs, retrievalChain } = await rag.createChunksAndVectorStore();

      const result = await retrievalChain.invoke({
        input: `Analyze the web page content and provide a comprehensive summary. Return ONLY a valid JSON object (no markdown, no code blocks, no extra text) with these exact fields:
{
  "topic": "A concise title for this content",
  "summarization": "A detailed, well-structured summary paragraph of the content",
  "keypoints": ["key point 1", "key point 2", "key point 3"],
  "actionpoints": ["action item 1", "action item 2"],
  "details": "Additional in-depth details about the content",
  "quotes": ["notable quote 1", "notable quote 2"],
  "tags": ["tag1", "tag2", "tag3"]
}
IMPORTANT: Return ONLY the JSON object. No markdown formatting, no backticks, no explanation before or after.`,
      });

      const resultString = result.answer;
      console.log("Web Summary Raw Response (first 500 chars):", resultString.substring(0, 500));
      
      let parsed: any = {};
      try {
        // Strategy 1: Try direct parse
        parsed = JSON.parse(resultString.trim());
      } catch (e1) {
        try {
          // Strategy 2: Remove markdown code blocks and parse
          const cleaned = resultString
            .replace(/^```(?:json)?\s*\n?/gm, "")
            .replace(/\n?```\s*$/gm, "")
            .trim();
          parsed = JSON.parse(cleaned);
        } catch (e2) {
          try {
            // Strategy 3: Extract JSON object using balanced brace matching
            const startIdx = resultString.indexOf("{");
            if (startIdx !== -1) {
              let depth = 0;
              let endIdx = startIdx;
              for (let i = startIdx; i < resultString.length; i++) {
                if (resultString[i] === "{") depth++;
                else if (resultString[i] === "}") {
                  depth--;
                  if (depth === 0) { endIdx = i; break; }
                }
              }
              const jsonStr = resultString.substring(startIdx, endIdx + 1);
              parsed = JSON.parse(jsonStr);
            } else {
              throw new Error("No JSON object found in response");
            }
          } catch (e3) {
            console.error("All JSON parse strategies failed for Web Summary:", e3);
            // Final fallback: treat the entire response as a plain-text summary
            // Clean up any JSON-like artifacts for display
            const cleanText = resultString
              .replace(/^```(?:json)?\s*\n?/gm, "")
              .replace(/\n?```\s*$/gm, "")
              .replace(/^\s*\{/, "")
              .replace(/\}\s*$/, "")
              .replace(/"(topic|summarization|keypoints|actionpoints|details|quotes|tags)"\s*:\s*/gi, "")
              .trim();
            parsed = {
              summarization: cleanText || resultString,
              topic: "Web Page Summary",
              keypoints: [],
              actionpoints: [],
              details: "",
              quotes: [],
              tags: []
            };
          }
        }
      }

      // Save summary
      const summary = await saveGeneratedSummaryFromWeb(
        new GeneratedSummaryFromWeb({
          url: payloadValue.url,
          actionPoints: parsed.actionpoints || parsed.actionPoints || [],
          details: parsed.details || "",
          aiResponse: JSON.stringify(parsed),
          quotes: parsed.quotes || [],
          tags: parsed.tags || [],
          keyPoints: parsed.keypoints || parsed.keyPoints || [],
          summarization: parsed.summarization || parsed.summary || "",
          userId: authUser._id as Types.ObjectId,
          topic: parsed.topic || parsed.title || "Web Page Summary",
        })
      );

      // Deduct credit
      await deductCreditFromUserAccount(authUser._id);
      await saveHistory(
        new History({
          modelId: [summary._id],
          modelName: getModelByName.SummaryWeb,
          userId: authUser._id.toString(),
        })
      );
      return res.status(200).json({
        result: summary,
      });
    } catch (error: any) {
      console.error("Error in generate summary from web (Direct):", error);
      let errorMessage = error.message || "Something went wrong, please try again";
      let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;

      if (error.isJoi) {
        statusCode = StatusCodes.UNPROCESSABLE_ENTITY;
      }

      return res.status(statusCode).json({ message: errorMessage });
    }
  };

  // protected readonly create = async (req: Request, res: Response) => {
  //   try {
  //     const authUser = req.authUser;
  //     const payloadValue = await this.createSummarySchema.validateAsync(
  //       req.body,
  //       { stripUnknown: true }
  //     );

  //     if (!payloadValue) {
  //       return res.status(422).json({ message: "Invalid Payload" });
  //     }
  //     if (!payloadValue.url.startsWith("http")) {
  //       throw new Error("Invalid Url");
  //     }
  //     const rag = new BuildRAG("web", payloadValue);
  //     const { docs, retrievalChain } = await rag.createChunksAndVectorStore();
  //     res.setHeader("Content-Type", "text/event-stream");
  //     res.setHeader("Cache-Control", "no-cache");
  //     res.setHeader("Connection", "keep-alive");
  //     res.flushHeaders();

  //     const result = await retrievalChain.stream({
  //       input: `give me all the data along with summary in json object`,
  //     });
  //     let resultString = "";
  //     for await (const chunk of result) {
  //       resultString += chunk.answer || "";
  //       res.write(`event: answer\n`);
  //       res.write(`data: ${JSON.stringify(chunk?.answer)}\n\n`);
  //     }
  //     const cleanJson = resultString.replace(/```json\n?|\n```/g, "");
  //     const parsed = JSON.parse(cleanJson);
  //     const summary = await saveGeneratedSummaryFromWeb(
  //       new GeneratedSummaryFromWeb({
  //         url: payloadValue.url,
  //         actionPoints: parsed.actionPoints,
  //         details: parsed.details,
  //         aiResponse: JSON.stringify(parsed),
  //         quotes: parsed.quotes,
  //         tags: parsed.tags,
  //         keyPoints: parsed.keypoints,
  //         summary: parsed.summary,
  //         userId: authUser._id as Types.ObjectId,
  //         topic: parsed.topic,
  //       })
  //     );

  //     await deductCreditFromUserAccount(authUser._id);
  //     res.write(`event: metadata\n`);
  //     res.write(`data: ${JSON.stringify(summary)}\n\n`);
  //     res.write(`event: done\ndata: {}\n\n`);
  //     res.end();
  //   } catch (error) {
  //     console.log("error", "error in create generatedSummary", error);
  //     return res.status(500).json({
  //       message:
  //         "Something happened wrong try again generatedSummary after sometime",
  //       error: JSON.stringify(error.message),
  //     });
  //   }
  // };

  protected readonly update = async (req: Request, res: Response) => {
    const authUser = req.authUser;
    const summaryId = req.params.id;
    try {
      const payloadValue = await this.updateSchema.validateAsync(req.body);

      if (!payloadValue) {
        return res.status(422).json({ message: "Invalid payload" });
      }
      const summary = await checkWebSummaryIsExistById(summaryId, authUser._id);
      if (!summary) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "Summary not found", success: false });
      }
      const updated = await updateWebSummary(summaryId, payloadValue);
      return res
        .status(StatusCodes.OK)
        .json({ message: "Summary updated", success: true, result: updated });
    } catch (error) {
      if (error.isJoi) {
        return res.status(422).json({ message: error.message });
      }
      console.log("error", "error in update web summary", error);
      return res.status(500).json({
        message:
          "Something happened wrong try again update summary after sometime",
        error: JSON.stringify(error.message),
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
      console.log("error", "error in delete web summary", error);
      return res.status(500).json({
        message:
          "Something happened wrong try again delete summary after sometime",
        error: JSON.stringify(error.message),
      });
    }
  };
}
