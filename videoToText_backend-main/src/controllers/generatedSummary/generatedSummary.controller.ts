import { model } from "mongoose";
import { AssemblyAI } from "assemblyai";
import { Response } from "express";
import Joi, { isError } from "joi";
import { getAudioById } from "../../modules/audio";
import {
  GeneratedSummary,
  getGeneratedSummaryById,
  saveGeneratedSummary,
} from "../../modules/generatedSummary";
import { getImageById } from "../../modules/image";
import { Request } from "../../request";
import { updateGeneratedSummary } from "../../modules/generatedSummary/updateGeneratedSummary";

export default class Controller {
  protected readonly generatedSummaryCreateSchema = Joi.object().keys({
    audioUrl: Joi.string().required(),
    fileId: Joi.string()
      .optional()
      .external(async (v: string) => {
        if (!v) return v;
        const file = await getAudioById(v);
        if (!file) {
          throw new Error("File not found");
        }
      }),
    imageId: Joi.string()
      .optional()
      .external(async (v: string) => {
        if (!v) return v;
        const image = await getImageById(v);
        if (!image) {
          throw new Error("image not found");
        }
        return v;
      }),
    duration: Joi.string().required(),
    model: Joi.string()
      .required()
      .valid(
        "Summarization",
        "Content Moderation",
        "Sentiment Analysis",
        "Entity Detection",
        "Topic Detection",
        "Auto Chapters",
        "Key Phrases",
        "PII Redaction"
      ),
    summary_model: Joi.when("model", {
      is: "Summarization",
      then: Joi.string()
        .required()
        .valid("informative", "conversational", "catchy"),
      otherwise: Joi.string().optional(),
    }),
    summary_type: Joi.when("model", {
      is: "Summarization",
      then: Joi.string()
        .required()
        .valid("bullets", "paragraph", "bullets_verbose", "gist", "headline"),
      otherwise: Joi.string().optional(),
    }),
    redact_pii_sub: Joi.when("mode", {
      is: "PII Redaction",
      then: Joi.string().required().valid("hash", "entity_name"),
      otherwise: Joi.string().optional(),
    }),
    language_code: Joi.string().optional(),
  });

  protected readonly create = async (req: Request, res: Response) => {
    try {
      const authUser = req.authUser;
      const payloadValue = await this.generatedSummaryCreateSchema
        .validateAsync(req.body)
        .then((value) => {
          return value;
        })
        .catch((e) => {
          if (isError(e)) {
            res.status(422).json(e);
          } else {
            res.status(422).json({ message: e.message });
          }
        });
      if (!payloadValue) {
        return;
      }
      const client = new AssemblyAI({
        apiKey: process.env.ASSEMBLYAI_KEY,
      });

      let params;
      params = {
        audio: payloadValue.audioUrl,
      };
      if (payloadValue.language_code) {
        params.language_code = payloadValue.language_code;
      } else {
        params.language_detection = true;
      }
      if (payloadValue.summary_model == "conversational") {
        params.speaker_labels = true;
        // params.dual_channel = true;
      }
      let obj = {
        transcript: "",
        summarization: "",
        content_moderation: [],
        sentiment_nalysis: [],
        entity_detection: [],
        topic_detection: [],
        auto_chapters: [],
        key_phrases: [],
        pii_redaction: "",
      };

      if (payloadValue.model == "Summarization") {
        params.summarization = true;
        params.summary_model = payloadValue.summary_model;
        params.summary_type = payloadValue.summary_type;
        params.punctuate = true;
        params.format_text = true;
      } else if (payloadValue.model == "Content Moderation") {
        params.content_safety = true;
      } else if (payloadValue.model == "Sentiment Analysis") {
        params.sentiment_analysis = true;
      } else if (payloadValue.model == "Entity Detection") {
        params.entity_detection = true;
      } else if (payloadValue.model == "Topic Detection") {
        params.iab_categories = true;
      } else if (payloadValue.model == "Auto Chapters") {
        params.auto_chapters = true;
      } else if (payloadValue.model == "Key Phrases") {
        params.auto_highlights = true;
      } else if (payloadValue.model == "PII Redaction") {
        params.redact_pii = true;
        params.redact_pii_policies = [
          "person_name",
          "organization",
          "occupation",
        ];
        params.redact_pii_sub = payloadValue.redact_pii_sub;
      }
      const transcript = await client.transcripts.transcribe(params);
      if (transcript.status === "error") {
        console.log(`Transcription failed: ${transcript.error}`);
        res.status(500).json({ message: "Transcription failed" });
      } else {
        obj.transcript = transcript.text;

        if (payloadValue.model == "Summarization") {
          obj.summarization = transcript.summary;
        } else if (payloadValue.model == "Content Moderation") {
          const contentSafetyLabels = transcript.content_safety_labels;
          if (contentSafetyLabels.results.length == 0) {
            obj.content_moderation.push(
              "No content safety labels found for this transcript."
            );
          } else {
            // Get the parts of the transcript which were flagged as sensitive
            for (const result of contentSafetyLabels.results) {
              // Get category, confidence, and severity
              for (const label of result.labels) {
                obj.content_moderation.push(
                  `${result.text} \n Timestamp: ${result.timestamp.start} - ${
                    result.timestamp.end
                  } \n ${label.label} - ${label.confidence.toFixed(2)}`
                );
              }
            }

            // Get the confidence of the most common labels in relation to the entire audio file
            for (const [label, confidence] of Object.entries(
              contentSafetyLabels.summary
            )) {
              obj.content_moderation.push(
                `${Math.round(
                  confidence * 100
                )}% confident that the audio contains ${label}`
              );
            }
          }
          // return res.status(200).json(transcript.text);
        } else if (payloadValue.model == "Sentiment Analysis") {
          if (transcript.sentiment_analysis_results.length == 0) {
            obj.sentiment_nalysis.push(
              "No sentiment analysis found for this transcript."
            );
          } else {
            for (const result of transcript.sentiment_analysis_results) {
              obj.sentiment_nalysis.push(
                `${result.text} \n ${
                  result.sentiment
                } \n ${result.confidence.toFixed(2)} \n Timestamp: ${
                  result.start
                } - ${result.end}`
              );
            }
          }
        } else if (payloadValue.model == "Entity Detection") {
          if (transcript.entities.length == 0) {
            obj.entity_detection.push("No entities found for this transcript.");
          } else {
            for (const entity of transcript.entities) {
              obj.entity_detection.push(
                `${entity.text} \n ${entity.entity_type} \n Timestamp: ${entity.start} - ${entity.end}`
              );
            }
          }
        } else if (payloadValue.model == "Topic Detection") {
          const summary = transcript.iab_categories_result.summary;
          const keys = Object.keys(summary);
          if (keys.length == 0) {
            console.log("No topics found for this transcript.");
          } else {
            for (let i = 0; i < Math.min(keys.length, 5); i++) {
              obj.topic_detection.push(
                `Audio is ${(summary[keys[i]] * 100).toFixed(0)}% relevant to ${
                  keys[i]
                }`
              );
            }
          }
        } else if (payloadValue.model == "Auto Chapters") {
          if (transcript.chapters.length == 0) {
            console.log("No chapters found for this transcript.");
          } else {
            for (const chapter of transcript.chapters) {
              obj.auto_chapters.push(
                `<b>${chapter.gist}</b> \n ${chapter.headline}`
              );
            }
          }
        } else if (payloadValue.model == "Key Phrases") {
          if (transcript.auto_highlights_result.results.length == 0) {
            console.log("No key phrases found for this transcript.");
          } else {
            for (const result of transcript.auto_highlights_result.results) {
              obj.key_phrases.push(result.text);
            }
          }
        } else if (payloadValue.model == "PII Redaction") {
          obj.pii_redaction = transcript.text;
        }
        let data = await saveGeneratedSummary(
          new GeneratedSummary({
            ...payloadValue,
            summaryId: transcript.id,
            language: transcript.language_code,
            userId: authUser._id,
            ...obj,
          })
        );
        return res.status(200).json({ ...payloadValue, ...data.toObject() });
      }
    } catch (error) {
      console.log("error", "error in create generatedSummary", error);
      return res.status(500).json({
        message:
          "Something happened wrong try again generatedSummary after sometime",
        error: JSON.stringify(error),
      });
    }
  };
  protected readonly update = async (req: Request, res: Response) => {
    try {
      const authUser = req.authUser;
      const summaryId = req.params.id;
      const generatedSummary = await getGeneratedSummaryById(summaryId);
      if (!generatedSummary) {
        return res.status(404).json({ message: "Generated Summary not found" });
      }
      const payloadValue = await this.generatedSummaryCreateSchema
        .validateAsync(req.body)
        .then((value) => {
          return value;
        })
        .catch((e) => {
          if (isError(e)) {
            res.status(422).json(e);
          } else {
            res.status(422).json({ message: e.message });
          }
        });
      if (!payloadValue) {
        return;
      }
      const client = new AssemblyAI({
        apiKey: process.env.ASSEMBLYAI_KEY,
      });

      let params;
      params = {
        audio: payloadValue.audioUrl,
        language_detection: true,
      };
      let obj = {
        transcript: "",
        summarization: "",
        content_moderation: [],
        sentiment_nalysis: [],
        entity_detection: [],
        topic_detection: [],
        auto_chapters: [],
        key_phrases: [],
        pii_redaction: "",
      };
      if (payloadValue.model == "Summarization") {
        params.summarization = true;
        params.summary_model = payloadValue.summary_model;
        params.summary_type = payloadValue.summary_type;
      } else if (payloadValue.model == "Content Moderation") {
        params.content_safety = true;
      } else if (payloadValue.model == "Sentiment Analysis") {
        params.sentiment_analysis = true;
      } else if (payloadValue.model == "Entity Detection") {
        params.entity_detection = true;
      } else if (payloadValue.model == "Topic Detection") {
        params.iab_categories = true;
      } else if (payloadValue.model == "Auto Chapters") {
        params.auto_chapters = true;
      } else if (payloadValue.model == "Key Phrases") {
        params.auto_highlights = true;
      } else if (payloadValue.model == "PII Redaction") {
        params.redact_pii = true;
        params.redact_pii_policies = [
          "person_name",
          "organization",
          "occupation",
        ];
        params.redact_pii_sub = payloadValue.redact_pii_sub;
      }
      const transcript = await client.transcripts.transcribe(params);
      if (transcript.status === "error") {
        console.log(`Transcription failed: ${transcript.error}`);
        res.status(500).json({ message: "Transcription failed" });
      } else {
        obj.transcript = transcript.text;

        if (payloadValue.model == "Summarization") {
          obj.summarization = transcript.summary;
        } else if (payloadValue.model == "Content Moderation") {
          const contentSafetyLabels = transcript.content_safety_labels;
          if (contentSafetyLabels.results.length == 0) {
            obj.content_moderation.push(
              "No content safety labels found for this transcript."
            );
          } else {
            // Get the parts of the transcript which were flagged as sensitive
            for (const result of contentSafetyLabels.results) {
              // Get category, confidence, and severity
              for (const label of result.labels) {
                obj.content_moderation.push(
                  `${result.text} \n Timestamp: ${result.timestamp.start} - ${
                    result.timestamp.end
                  } \n ${label.label} - ${label.confidence.toFixed(2)}`
                );
              }
            }

            // Get the confidence of the most common labels in relation to the entire audio file
            for (const [label, confidence] of Object.entries(
              contentSafetyLabels.summary
            )) {
              obj.content_moderation.push(
                `${Math.round(
                  confidence * 100
                )}% confident that the audio contains ${label}`
              );
            }
          }
          // return res.status(200).json(transcript.text);
        } else if (payloadValue.model == "Sentiment Analysis") {
          if (transcript.sentiment_analysis_results.length == 0) {
            obj.sentiment_nalysis.push(
              "No sentiment analysis found for this transcript."
            );
          } else {
            for (const result of transcript.sentiment_analysis_results) {
              obj.sentiment_nalysis.push(
                `${result.text} \n ${
                  result.sentiment
                } \n ${result.confidence.toFixed(2)} \n Timestamp: ${
                  result.start
                } - ${result.end}`
              );
            }
          }
        } else if (payloadValue.model == "Entity Detection") {
          if (transcript.entities.length == 0) {
            obj.entity_detection.push("No entities found for this transcript.");
          } else {
            for (const entity of transcript.entities) {
              obj.entity_detection.push(
                `${entity.text} \n ${entity.entity_type} \n Timestamp: ${entity.start} - ${entity.end}`
              );
            }
          }
        } else if (payloadValue.model == "Topic Detection") {
          const summary = transcript.iab_categories_result.summary;
          const keys = Object.keys(summary);
          if (keys.length == 0) {
            console.log("No topics found for this transcript.");
          } else {
            for (let i = 0; i < Math.min(keys.length, 5); i++) {
              obj.topic_detection.push(
                `Audio is ${(summary[keys[i]] * 100).toFixed(0)}% relevant to ${
                  keys[i]
                }`
              );
            }
          }
        } else if (payloadValue.model == "Auto Chapters") {
          if (transcript.chapters.length == 0) {
            console.log("No chapters found for this transcript.");
          } else {
            for (const chapter of transcript.chapters) {
              obj.auto_chapters.push(
                `<b>${chapter.gist}</b> \n ${chapter.headline}`
              );
            }
          }
        } else if (payloadValue.model == "Key Phrases") {
          if (transcript.auto_highlights_result.results.length == 0) {
            console.log("No key phrases found for this transcript.");
          } else {
            for (const result of transcript.auto_highlights_result.results) {
              obj.key_phrases.push(result.text);
            }
          }
        } else if (payloadValue.model == "PII Redaction") {
          obj.pii_redaction = transcript.text;
        }

        let data = await updateGeneratedSummary(
          new GeneratedSummary({
            ...generatedSummary,
            ...payloadValue,
            summaryId: transcript.id,
            language: transcript.language_code,
            userId: authUser._id,
            ...obj,
          })
        );
        return res.status(200).json(data);
      }
    } catch (error) {
      console.log("error", "error in update generatedSummary", error);
      return res.status(500).json({
        message:
          "Something happened wrong try again generatedSummary after sometime",
        error: JSON.stringify(error),
      });
    }
  };
}
