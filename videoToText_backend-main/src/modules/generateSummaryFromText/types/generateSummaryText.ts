import { isNil, isUndefined, omitBy } from "lodash";
import { Types } from "mongoose";
import { IFolders } from "../../folders/types";
import { IUser } from "../../user";

export interface IGenerateSummaryText {
  _id?: Types.ObjectId;
  text?: string;
  aiResponse?: string;
  summarization?: string;
  folderId?: Types.ObjectId | IFolders;
  userId?: Types.ObjectId | IUser;
  keyPoints?: string[];
  title?: string;
  actionPoints?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class GenerateSummaryText implements IGenerateSummaryText {
  _id?: Types.ObjectId;
  text?: string;
  summarization?: string;
  aiResponse?: string;
  folderId?: Types.ObjectId | IFolders;
  userId?: Types.ObjectId | IUser;
  keyPoints?: string[];
  title?: string;
  actionPoints?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  constructor(input?: IGenerateSummaryText) {
    Object.assign(this, input);
  }
  toJSON() {
    return omitBy(this, isUndefined) as IGenerateSummaryText;
  }

  toComparable(): IGenerateSummaryText {
    return omitBy(this, isNil) as IGenerateSummaryText;
  }
}
