import { Response } from "express";
import { Request } from "../../request";
import { getLlm } from "../../llm";
import { LanguageModelLike } from "@langchain/core/language_models/base";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { getSummaryFromSouceAndSummaryId } from "../../modules/chatWithAI/getSummaryFromSource";
import Joi from "joi";
import { StatusCodes } from "http-status-codes";
import { getFlashCard, saveFlashCard } from "../../modules/flashcard";
import { FlashCard } from "../../modules/flashcard/types";
import { deductCreditFromUserAccount } from "../../modules/user/deductCredit";
import { answered, getQuizById, saveQuiz } from "../../modules/quiz";
import { getResult } from "../../modules/quiz/getResult";
import { getModelByName, History, saveHistory } from "../../modules/history";

export default class Controller {
  private llm: LanguageModelLike;
  private createQuizSchema = Joi.object().keys({
    source: Joi.string()
      .valid("pdf", "video", "text", "audio", "web")
      .required(),
    summaryId: Joi.string().required(),
  });
  protected readonly create = async (req: Request, res: Response) => {
    const authUser = req.authUser;
    try {
      const payloadValue = await this.createQuizSchema.validateAsync(req.body, {
        stripUnknown: true,
      });
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
      const lang = (summary as any).language || "English";
      const prompt = `You're an expert AI tutor who creates quizzes.
      
Generate the quiz in the ${lang} language.

Based on the following context, generate a multiple-choice quiz to test understanding. Each question should be clear, relevant, and cover important concepts from the context.

Rules:
- Generate 5 questions.
- Each question must have exactly 4 options (A, B, C, D).
- Strictly return ONLY a valid JSON object. No extra text, no apologies, no markdown blocks.
- Output MUST follow this JSON schema:
{{
  "quiz": [
    {{
      "question": "The question text in ${lang}",
      "options": {{
        "A": "Option 1 in ${lang}",
        "B": "Option 2 in ${lang}",
        "C": "Option 3 in ${lang}",
        "D": "Option 4 in ${lang}"
      }},
      "answer": "A"
    }}
  ]
}}

Context:
"""
{context}
"""

Begin.
`;
      const systemPrompt = ChatPromptTemplate.fromTemplate(prompt).pipe(
        this.llm
      );

      const contextStr = JSON.stringify({
        summary: summary?.summarization || summary?.summary,
        transcript: summary?.transcript,
        actionPoints: summary?.actionPoints,
        keyPoints: summary?.keyPoints,
        aiResponse: summary?.aiResponse,
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
        // Robust JSON extraction
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        let cleanJson = jsonMatch ? jsonMatch[0] : content.replace(/```json\n?|\n```/g, "").trim();
        
        // Remove potential trailing commas before closing braces/brackets
        cleanJson = cleanJson.replace(/,\s*([\}\]])/g, '$1');
        
        // Handle potential unescaped newlines in JSON strings (common AI mistake)
        // This is risky but often necessary for valid JSON.parse
        cleanJson = cleanJson.replace(/\n/g, "\\n");
        // Re-fix common structural newlines that shouldn't be escaped
        cleanJson = cleanJson.replace(/\\n\s*"/g, '\n "').replace(/"\s*\\n/g, '" \n').replace(/\\n\s*\{/g, '\n {').replace(/\}\s*\\n/g, '} \n').replace(/\\n\s*\[/g, '\n [').replace(/\]\s*\\n/g, '] \n');
        
        try {
            parsed = JSON.parse(cleanJson);
        } catch (innerError) {
            // Last ditch effort: try to fix missing closing braces
            let openBraces = (cleanJson.match(/\{/g) || []).length;
            let closeBraces = (cleanJson.match(/\}/g) || []).length;
            while(openBraces > closeBraces) {
                cleanJson += "}";
                closeBraces++;
            }
            let openBrackets = (cleanJson.match(/\[/g) || []).length;
            let closeBrackets = (cleanJson.match(/\]/g) || []).length;
            while(openBrackets > closeBrackets) {
                cleanJson += "]";
                closeBrackets++;
            }
            parsed = JSON.parse(cleanJson);
        }
      } catch (e) {
        console.error("JSON Parse Error in Quiz:", e);
        throw new Error(`AI generated invalid JSON format for quiz. Raw content: ${content.substring(0, 200)}... Error: ${e.message}`);
      }
      
      const quiz = parsed.quiz;

      if (!Array.isArray(quiz)) {
        throw new Error("AI generated invalid quiz format: 'quiz' is not an array");
      }
      let storedData = [];
      let commonData = {
        ...payloadValue,
        userId: authUser._id,
      };
      for (const value of quiz) {
        storedData.push({
          ...commonData,
          que: value.question,
          options: value.options,
          correctOption: value.answer,
        });
      }

      const data = await saveQuiz(storedData);
      await deductCreditFromUserAccount(authUser._id);
      const modelIds = Array.isArray(data)
        ? data.map((card) => card._id)
        : [data._id];
      await saveHistory(
        new History({
          modelId: modelIds,
          modelName: getModelByName.Quiz,
          userId: authUser._id.toString(),
        })
      );
      return res.status(StatusCodes.OK).json({
        message: "Quiz Generated",
        success: true,
        result: data,
      });
    } catch (error: any) {
      if (error.isJoi) {
        return res.status(422).json({ message: error.message });
      }
      console.log("error", "error in create quiz", error);
      return res.status(500).json({
        message: `Quiz Generation Error: ${error.message || "Something went wrong"}`,
        error: error.stack || error.message || JSON.stringify(error),
      });
    }
  };
  private answeredQuizSchema = Joi.object().keys({
    quizId: Joi.string().required(),
    answeredOption: Joi.string().valid("A", "B", "C", "D").required(),
  });
  protected readonly answered = async (req: Request, res: Response) => {
    const authUser = req.authUser;
    try {
      const payloadValue = await this.answeredQuizSchema.validateAsync(
        req.body,
        {
          stripUnknown: true,
        }
      );
      if (!payloadValue) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Invalid Payload", success: false });
      }
      const isQuizExist = await getQuizById(payloadValue.quizId, authUser._id);
      if (!isQuizExist) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "Invalid Quiz", success: false });
      }
      if (isQuizExist.isAnswered) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "You already tick answer", success: false });
      }
      const result = await answered(isQuizExist, payloadValue.answeredOption);
      res.status(StatusCodes.OK).json({
        message: "Answered Successfully Submitted",
        success: true,
        result,
      });
    } catch (error) {
      if (error.isJoi) {
        return res.status(422).json({ message: error.message });
      }
      console.log("error", "error in answered question of quiz", error);
      return res.status(500).json({
        message: "Something happened wrong tick answered again after sometime",
        error: JSON.stringify(error.message),
      });
    }
  };

  protected readonly result = async (req: Request, res: Response) => {
    const authUser = req.authUser;
    try {
      const payloadValue = await this.createQuizSchema.validateAsync(req.body, {
        stripUnknown: true,
      });
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
      const quizzes = await getResult(
        payloadValue.summaryId,
        payloadValue.source,
        authUser._id
      );
      quizzes.summary = summary;
      // if (quizzes.length === 0) {
      //   return res.status(StatusCodes.NOT_FOUND).json({
      //     message: "Quiz not found for this summary",
      //     success: false,
      //     // result: data,
      //   });
      // }
      // const notAnsweredQuestions = quizzes.filter(
      //   (quiz) => quiz.isAnswered === false
      // );
      // if (notAnsweredQuestions.length === 0) {
      //   return res.status(StatusCodes.NOT_FOUND).json({
      //     message: "Quiz Already Completed",
      //     success: false,
      //   });
      // }
      return res.status(StatusCodes.OK).json({
        message: "Fetched Quiz Result",
        success: true,
        result: quizzes,
      });
    } catch (error) {
      if (error.isJoi) {
        return res.status(422).json({ message: error.message });
      }
      console.log("error", "error in get quiz", error);
      return res.status(500).json({
        message: "Something happened wrong try again get quiz after sometime",
        error: JSON.stringify(error.message),
      });
    }
  };
}
