import { isUndefined, omitBy } from "lodash";
import { Types } from "mongoose";
import { IUser } from "../../user";
import { IGeneratedSummary } from "../../generatedSummary";

export interface IReport {
  _id?: string;
  reason: string;
  generatedSummaryId: string | IGeneratedSummary;
  reportedBy: string | IUser;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Report implements IReport {
  _id?: string;
  reason: string;
  generatedSummaryId: string | IGeneratedSummary;
  reportedBy: string | IUser;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(input: IReport) {
    this._id = input?._id
      ? input?._id.toString()
      : new Types.ObjectId().toString();
    this.reason = input?.reason;
    this.generatedSummaryId = input?.generatedSummaryId;
    this.reportedBy = input?.reportedBy;
    this.createdAt = input?.createdAt;
    this.updatedAt = input?.updatedAt;
  }

  toJSON(): IReport {
    return omitBy(this, isUndefined) as IReport;
  }
}
