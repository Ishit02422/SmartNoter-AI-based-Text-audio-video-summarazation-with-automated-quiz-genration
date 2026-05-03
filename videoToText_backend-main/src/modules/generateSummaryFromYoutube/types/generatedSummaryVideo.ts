import { isNil, isUndefined, omitBy } from "lodash";
import { IUser } from "../../user";
import { IFolders } from "../../folders/types";
import { Types } from "mongoose";

export interface IGeneratedSummaryVideo {
  _id?: string | Types.ObjectId;
  sourceType: string;
  title: string;
  language?: string;
  model?: string;
  summary_types?: string;
  summary_models?: string;
  videoUrl?: string;
  videoId?: string;
  aiResponse?: string;
  folderId?: IFolders | Types.ObjectId;
  transcript?: string;
  summarization?: string;
  userId?: IUser | string;
  createdAt?: Date;
  updatedAt?: Date;
  // audioUrl?: string;
  // pii_redaction?: string;
  // content_moderation?: string[];
  // sentiment_nalysis?: string[];
  // entity_detection?: string[];
  // topic_detection?: string[];
  // auto_chapters?: string[];
  // key_phrases?: string[];
  // imageId?: IImage | string;
}

export class GeneratedSummaryVideo implements IGeneratedSummaryVideo {
  _id?: string | Types.ObjectId;
  sourceType: string;
  title: string;
  language?: string;
  aiResponse?: string;
  summary_types?: string;
  folderId?: IFolders | Types.ObjectId;
  summary_models?: string;
  model?: string;
  videoUrl?: string;
  videoId?: string;
  transcript?: string;
  summarization?: string;
  userId?: IUser | string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(input?: IGeneratedSummaryVideo) {
    this._id = input._id;
    this.videoId = input.videoId;
    this.sourceType = input.sourceType;
    this.summary_models = input.summary_models;
    this.summary_types = input.summary_types;
    this.title = input.title;
    this.videoUrl = input.videoUrl;
    this.folderId = input.folderId;
    this.aiResponse = input.aiResponse;
    this.transcript = input.transcript;
    this.summarization = input.summarization;
    this.language = input.language;
    this.model = input.model;
    this.userId = input.userId;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }

  toJSON() {
    return omitBy(this, isUndefined) as IGeneratedSummaryVideo;
  }

  toComparable(): IGeneratedSummaryVideo {
    return omitBy(this, isNil) as IGeneratedSummaryVideo;
  }
}
