import { Response } from "express";
import { Request } from "../../request";
import { get as _get } from "lodash";
import { createAndUploadPDF, getPdfById } from "../../modules/pdf";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import gTTS from "gtts";
import Joi from "joi";
import { getSummaryFromSouceAndSummaryId } from "../../modules/chatWithAI/getSummaryFromSource";
import { StatusCodes } from "http-status-codes";
import { getTranslatedSummary } from "../../modules/translate/getTranslatedSummary";
export default class Controller {
  private generateAudioSchema = Joi.object().keys({
    source: Joi.string()
      .valid("pdf", "video", "audio", "web", "text")
      .required(),
    summaryId: Joi.string().required(),
  });
  protected readonly create = async (req: Request, res: Response) => {
    try {
      const authUser = req.authUser;
      const payloadValue = await this.generateAudioSchema.validateAsync(
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
      const text = summary.summarization || summary?.summary;
      const fileName = `${uuidv4()}.mp3`;
      const filePath = path.join(__dirname, "audios", fileName);

      const gtts = new gTTS(text, "en");

      // Create audios folder if not exists
      if (!fs.existsSync(path.join(__dirname, "audios"))) {
        fs.mkdirSync(path.join(__dirname, "audios"));
      }

      gtts.save(filePath, (err) => {
        if (err) {
          return res.status(500).json({ error: "TTS failed" });
        }

        res.sendFile(filePath, (err) => {
          if (!err) {
            // Optional: delete the file after sending it
            setTimeout(() => fs.unlinkSync(filePath), 10000); // delete after 10s
          }
        });
      });
    } catch (error) {
      if (error.isJoi) {
        return res.status(422).json({ message: error.message });
      }
      console.log("error", "error in generate summary audio", error);
      return res.status(500).json({
        message:
          "Something happened wrong try again audio summary after sometime",
        error: JSON.stringify(error.message),
      });
    }
  };

  private generateTranslatedSummaryAudioSchema = Joi.object().keys({
    source: Joi.string()
      .valid("pdf", "video", "audio", "web", "text")
      .required(),
    summaryId: Joi.string().required(),
    language: Joi.string().custom((value, helpers) => {
      if (typeof value !== "string") return value;
      return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    }),
  });
  protected readonly createAudioForTranslatedSummary = async (
    req: Request,
    res: Response
  ) => {
    try {
      const authUser = req.authUser;
      const payloadValue =
        await this.generateTranslatedSummaryAudioSchema.validateAsync(
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
      const translatedSummary = await getTranslatedSummary(
        summary._id,
        payloadValue.source,
        payloadValue.language,
        authUser._id
      );
      if (!translatedSummary) {
        return res.status(StatusCodes.NOT_FOUND).json({
          message:
            "First Translate Summary in Specific Language then Generate Audio",
          success: false,
        });
      }
      const text = translatedSummary.translatedSummary;
      const fileName = `${uuidv4()}.mp3`;
      const filePath = path.join(__dirname, "audios", fileName);

      const gtts = new gTTS(text, "en");

      // Create audios folder if not exists
      if (!fs.existsSync(path.join(__dirname, "audios"))) {
        fs.mkdirSync(path.join(__dirname, "audios"));
      }

      gtts.save(filePath, (err) => {
        if (err) {
          return res.status(500).json({ error: "TTS failed" });
        }

        res.sendFile(filePath, (err) => {
          if (!err) {
            // Optional: delete the file after sending it
            setTimeout(() => fs.unlinkSync(filePath), 10000); // delete after 10s
          }
        });
      });
    } catch (error) {
      if (error.isJoi) {
        return res.status(422).json({ message: error.message });
      }
      console.log("error", "error in generate translated summary audio", error);
      return res.status(500).json({
        message:
          "Something happened wrong try again generate translated summary audio after sometime",
        error: JSON.stringify(error.message),
      });
    }
  };
}
