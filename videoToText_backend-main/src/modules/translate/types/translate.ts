import { Types } from "mongoose";
import { IUser } from "../../user";
import { isUndefined, omitBy } from "lodash";

export interface ITranslate {
  _id?: Types.ObjectId;
  translatedLanguage?: string;
  translatedSummary?: string;
  title?: string;
  summaryId?: string | Types.ObjectId;
  userId?: IUser | string;
  source: string;
  originalSummary?: string;
  createdAt?: Date;
  updateAt?: Date;
}

export class Translate implements ITranslate {
  _id?: Types.ObjectId;
  translatedLanguage?: string;
  translatedSummary?: string;
  summaryId?: string;
  userId?: string 
  source: string;
  title?: string;
  originalSummary?: string;
  createdAt?: Date;
  updateAt?: Date;
  constructor(input?: ITranslate) {
    Object.assign(this, input);
  }
  toJSON(): IUser {
    return omitBy(this, isUndefined) as IUser;
  }
}
