import { isNil, isUndefined, omitBy } from "lodash";
import { IUser } from "../../user";
import { IImage } from "../../image";
import { Types } from "mongoose";
import { IFolders } from "../../folders/types";

export interface IGeneratedSummaryAudio {
  _id?: Types.ObjectId;
  //   summary_duration?: string;
  summary_type?: string;
  duration?: string;
  language?: string;
  title?: string;
  model?: string;
  aiResponse?: string;
  audioUrl?: string;
  transcriptId?: string;
  folderId?: IFolders | Types.ObjectId;
  transcript?: string;
  fileId?: Types.ObjectId;
  summary_models?: string;
  summarization?: string;
  //   pii_redaction?: string;
  //   content_moderation?: string[];
  //   sentiment_nalysis?: string[];
  //   entity_detection?: string[];
  //   topic_detection?: string[];
  //   auto_chapters?: string[];
  keyPoints?: string[];
  userId?: IUser | string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class GeneratedSummaryAudio implements IGeneratedSummaryAudio {
  _id?: Types.ObjectId;
  //   summary_duration?: string;
  summary_type?: string;
  duration?: string;
  language?: string;
  title?: string;
  aiResponse?: string;
  model?: string;
  folderId?: IFolders | Types.ObjectId;
  summary_models?: string;
  audioUrl?: string;
  transcript?: string;
  transcriptId?: string;
  summarization?: string;
  fileId?: Types.ObjectId;
  //   pii_redaction?: string;
  //   content_moderation?: string[];
  //   sentiment_nalysis?: string[];
  //   entity_detection?: string[];
  //   topic_detection?: string[];
  //   auto_chapters?: string[];
  keyPoints?: string[];
  userId?: IUser | string;
  //   imageId?: IImage | string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(input?: IGeneratedSummaryAudio) {
    this._id = input._id;
    // this.summary_duration = input.summary_duration;
    this.duration = input.duration;
    this.summary_type = input.summary_type;
    this.title = input.title;
    this.language = input.language;
    this.fileId = input.fileId;
    this.model = input.model;
    this.aiResponse = input.aiResponse;
    this.summary_models = input.summary_models;
    this.audioUrl = input.audioUrl;
    this.transcriptId = input.transcriptId;
    this.transcript = input.transcript;
    this.folderId = input.folderId;
    this.summarization = input.summarization;
    // this.pii_redaction = input.pii_redaction;
    // this.content_moderation = input.content_moderation;
    // this.sentiment_nalysis = input.sentiment_nalysis;
    // this.entity_detection = input.entity_detection;
    // this.topic_detection = input.topic_detection;
    // this.auto_chapters = input.auto_chapters;
    this.keyPoints = input.keyPoints;
    this.userId = input.userId;
    // this.imageId = input.imageId;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }

  toJSON() {
    return omitBy(this, isUndefined) as IGeneratedSummaryAudio;
  }

  toComparable(): IGeneratedSummaryAudio {
    return omitBy(this, isNil) as IGeneratedSummaryAudio;
  }
}
