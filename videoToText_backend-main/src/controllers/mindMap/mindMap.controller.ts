import { LanguageModelLike } from "@langchain/core/language_models/base";
import Joi from "joi";
import { Request } from "../../request";
import { Response } from "express";
import { getLlm } from "../../llm";
import { getSummaryFromSouceAndSummaryId } from "../../modules/chatWithAI/getSummaryFromSource";
import { StatusCodes } from "http-status-codes";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { saveMindMap } from "../../modules/mindMap/saveMindMap";
import { deductCreditFromUserAccount } from "../../modules/user/deductCredit";
import say from "say";
import { getMindmapSummary } from "../../modules/mindMap/getMindMapBySummary";
import { getModelByName, History, saveHistory } from "../../modules/history";
import { Types } from "mongoose";
export default class Controller {
  private llm: LanguageModelLike;
  private createMindMapSchema = Joi.object().keys({
    source: Joi.string()
      .valid("pdf", "video", "audio", "web", "text")
      .required(),
    summaryId: Joi.string().required(),
  });
  protected readonly create = async (req: Request, res: Response) => {
    const authUser = req.authUser;
    try {
      const payloadValue = await this.createMindMapSchema.validateAsync(
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

      let parsed: any = {};
      try {
        // Strategy 1: strict parse
        parsed = JSON.parse(content.trim());
      } catch (e1) {
        try {
          // Strategy 2: Remove markdown code blocks and parse
          const cleaned = content
            .replace(/^```(?:json)?\s*\n?/gm, "")
            .replace(/\n?```\s*$/gm, "")
            .trim();
          parsed = JSON.parse(cleaned);
        } catch (e2) {
          try {
            // Strategy 3: Extract JSON object matching '{' and '}'
            const startIdx = content.indexOf("{");
            if (startIdx !== -1) {
              let depth = 0;
              let endIdx = startIdx;
              for (let i = startIdx; i < content.length; i++) {
                if (content[i] === "{") depth++;
                else if (content[i] === "}") {
                  depth--;
                  if (depth === 0) { endIdx = i; break; }
                }
              }
              const jsonStr = content.substring(startIdx, endIdx + 1);
              parsed = JSON.parse(jsonStr);
            } else {
              throw new Error("No JSON object found");
            }
          } catch (e3) {
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
      const data = await saveMindMap({ ...parsed, ...commonData });

      await deductCreditFromUserAccount(authUser._id);
      await saveHistory(
        new History({
          modelId: [new Types.ObjectId(data._id)],
          modelName: getModelByName.MindMap,
          userId: authUser._id.toString(),
        })
      );
      return res.status(StatusCodes.OK).json({
        message: "Mind Map Generated",
        success: true,
        result: data,
      });
    } catch (error: any) {
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

  protected readonly getMindMapBySummary = async (
    req: Request,
    res: Response
  ) => {
    const authUser = req.authUser;
    try {
      const payloadValue = await this.createMindMapSchema.validateAsync(
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
      if (!summary) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "Summary not found", success: false });
      }
      const data = await getMindmapSummary(
        summary._id,
        payloadValue.source,
        authUser._id
      );
      if (!data) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "Mind map not found", success: false });
      }
      return res.status(StatusCodes.OK).json({
        message: "Fetched Mind Map",
        success: true,
        result: data,
      });
    } catch (error) {
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
