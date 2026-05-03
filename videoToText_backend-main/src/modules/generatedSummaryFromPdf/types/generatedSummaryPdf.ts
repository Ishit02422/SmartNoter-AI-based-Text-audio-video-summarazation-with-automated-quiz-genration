import { Types } from "mongoose";
import { IUser } from "../../user";
import { isNil, isUndefined, omitBy } from "lodash";
import { IFolders } from "../../folders/types";

export interface IGenerateSummaryPdf {
  _id?: Types.ObjectId;
  summary_type?: string;
  language?: string;
  actionPoints?: string;
  title?: string;
  folderId?: IFolders | Types.ObjectId;
  pdfUrl?: string;
  fileId?: Types.ObjectId;
  aiResponse?: string;
  transcript?: string;
  summarization?: string;
  keyPoints?: string;
  userId?: IUser | string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class GeneratedSummaryPDF implements IGenerateSummaryPdf {
  _id?: Types.ObjectId;
  summary_type?: string;
  language?: string;
  title?: string;
  pdfUrl?: string;
  transcript?: string;
  folderId?: IFolders | Types.ObjectId;
  aiResponse?: string;
  fileId?: Types.ObjectId;
  summarization?: string;
  keyPoints?: string;
  actionPoints?: string;
  userId?: IUser | string;
  createdAt?: Date;
  updatedAt?: Date;
  constructor(input?: IGenerateSummaryPdf) {
    Object.assign(this, input);
  }
  toJSON() {
    return omitBy(this, isUndefined) as IGenerateSummaryPdf;
  }

  toComparable(): IGenerateSummaryPdf {
    return omitBy(this, isNil) as IGenerateSummaryPdf;
  }
}
