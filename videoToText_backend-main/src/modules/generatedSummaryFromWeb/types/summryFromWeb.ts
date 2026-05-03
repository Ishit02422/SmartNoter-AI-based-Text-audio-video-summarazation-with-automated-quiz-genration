import { isNil, isUndefined, omitBy } from "lodash";
import { Types } from "mongoose";
import { IUser } from "../../user";
import { IFolders } from "../../folders/types";

export interface IGeneratedSummaryFromWeb {
  _id?: Types.ObjectId;
  summarization?: string;
  topic?: string;
  details?: string;
  actionPoints?: string;
  keyPoints?: string;
  url?: string;
  userId?: IUser | Types.ObjectId;
  aiResponse?: string;
  tags?: string[] | string;
  folderId?: IFolders | Types.ObjectId;
  quotes?: string[] | string;
  createdAt?: Date;
  updatedAt?: Date;
}
export class GeneratedSummaryFromWeb implements IGeneratedSummaryFromWeb {
  _id?: Types.ObjectId;
  summarization?: string;
  topic?: string;
  details?: string;
  actionPoints?: string;
  tags?: string[] | string;
  quotes?: string[] | string;
  keyPoints?: string;
  userId?: IUser | Types.ObjectId;
  folderId?: IFolders | Types.ObjectId;
  url?: string;
  aiResponse?: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(input?: IGeneratedSummaryFromWeb) {
    Object.assign(this, input);
  }

  toJSON() {
    return omitBy(this, isUndefined) as IGeneratedSummaryFromWeb;
  }

  toComparable(): IGeneratedSummaryFromWeb {
    return omitBy(this, isNil) as IGeneratedSummaryFromWeb;
  }
}
