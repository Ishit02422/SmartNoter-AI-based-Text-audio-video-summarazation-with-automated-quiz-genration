import { isNil, isUndefined, omitBy } from "lodash";
import { IUser } from "../../user";
import { IImage } from "../../image";

export interface IGeneratedSummary {
  _id?: string;
  summary_duration?: string;
  duration?: string;
  language?: string;
  model?: string;
  audioUrl?: string;
  summaryId?: string;
  transcript?: string;
  summarization?: string;
  pii_redaction?: string;
  content_moderation?: string[];
  sentiment_nalysis?: string[];
  entity_detection?: string[];
  topic_detection?: string[];
  auto_chapters?: string[];
  key_phrases?: string[];
  userId?: IUser | string;
  imageId?: IImage | string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class GeneratedSummary implements IGeneratedSummary {
  _id?: string;
  summary_duration?: string;
  duration?: string;
  language?: string;
  model?: string;
  audioUrl?: string;
  summaryId?: string;
  transcript?: string;
  summarization?: string;
  pii_redaction?: string;
  content_moderation?: string[];
  sentiment_nalysis?: string[];
  entity_detection?: string[];
  topic_detection?: string[];
  auto_chapters?: string[];
  key_phrases?: string[];
  userId?: IUser | string;
  imageId?: IImage | string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(input?: IGeneratedSummary) {
    this._id = input._id;
    this.summary_duration = input.summary_duration;
    this.duration = input.duration;
    this.language = input.language;
    this.model = input.model;
    this.audioUrl = input.audioUrl;
    this.summaryId = input.summaryId;
    this.transcript = input.transcript;
    this.summarization = input.summarization;
    this.pii_redaction = input.pii_redaction;
    this.content_moderation = input.content_moderation;
    this.sentiment_nalysis = input.sentiment_nalysis;
    this.entity_detection = input.entity_detection;
    this.topic_detection = input.topic_detection;
    this.auto_chapters = input.auto_chapters;
    this.key_phrases = input.key_phrases;
    this.userId = input.userId;
    this.imageId = input.imageId;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }

  toJSON() {
    return omitBy(this, isUndefined) as IGeneratedSummary;
  }

  toComparable(): IGeneratedSummary {
    return omitBy(this, isNil) as IGeneratedSummary;
  }
}
