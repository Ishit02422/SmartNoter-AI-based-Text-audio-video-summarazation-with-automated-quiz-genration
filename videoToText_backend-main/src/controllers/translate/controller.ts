import { Response } from "express";
import { Request } from "../../request";
import Joi from "joi";
import { getLlm } from "../../llm";
import { StatusCodes } from "http-status-codes";
import { checkPdfSummaryIsExistById } from "../../modules/generatedSummaryFromPdf";
import { checkAudioSummaryIsExistById } from "../../modules/generatedSummaryFromAudio";
import { checkVideoSummaryIsExistById } from "../../modules/generateSummaryFromYoutube";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import ISO6391 from "iso-639-1";
import { deductCreditFromUserAccount } from "../../modules/user/deductCredit";
import { getSummaryFromSouceAndSummaryId } from "../../modules/chatWithAI/getSummaryFromSource";
import { getTranslatedSummary } from "../../modules/translate/getTranslatedSummary";
import { saveTranslatedSummary } from "../../modules/translate/saveTranslatedSummary";
import { ITranslate, Translate } from "../../modules/translate/types";
import { getModelByName, History, saveHistory } from "../../modules/history";
export default class Controller {
  protected readonly translateSummarySchema: Joi.ObjectSchema =
    Joi.object().keys({
      source: Joi.string()
        .valid("pdf", "audio", "video", "web", "text")
        .required(),
      summaryId: Joi.string().required(),
      language: Joi.string()
        .custom((value) => {
          return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
        })
        .required(),
    });
  protected readonly create = async (req: Request, res: Response) => {
    try {
      const authuser = req.authUser;
      const payloadValue = await this.translateSummarySchema
        .validateAsync(req.body)
        .catch((e: unknown) => {
          if (e instanceof Error) {
            return res.status(422).json({ message: e.message });
          }
          return res.status(422).json({ message: "Invalid payload" });
        });
      const llm = await getLlm();
      const summary = await getSummaryFromSouceAndSummaryId(
        payloadValue.source,
        payloadValue.summaryId,
        authuser._id
      );
      if (!summary) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "Summary not found", success: false });
      }
      const data = await getTranslatedSummary(
        summary._id,
        payloadValue.source,
        payloadValue.language,
        authuser._id
      );
      if (data) {
        return res.status(StatusCodes.OK).json({
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
      const promptSystem = ChatPromptTemplate.fromTemplate(prompt).pipe(llm);
      const result = await promptSystem.invoke({
        context: summary.summarization || summary.summary,
        input: `translate summary into ${payloadValue.language} language with bullet points format`,
      });
      const translatedData: ITranslate = {
        source: payloadValue.source,
        originalSummary: summary.summarization || summary.summary,
        summaryId: summary._id,
        translatedLanguage: payloadValue.language,
        translatedSummary: result.content as string,
        userId: authuser._id.toString(),
        title: `Translate Summary: ${summary?.title || summary?.topic} into ${
          payloadValue.language
        } language`,
      };
      const savedData = await saveTranslatedSummary(translatedData);
      await deductCreditFromUserAccount(authuser._id);
      await saveHistory(
        new History({
          modelId: [savedData._id],
          modelName: getModelByName.Translate,
          userId: authuser._id.toString(),
        })
      );
      return res.status(StatusCodes.OK).json({
        message: "Translated Successfully",
        success: true,
        result: savedData,
      });
    } catch (error) {
      console.log("error", "error in translate summary", error);
      return res.status(500).json({
        message:
          "Something happened wrong try again translate Summary after sometime",
        error: JSON.stringify(error.message),
      });
    }
  };
}
