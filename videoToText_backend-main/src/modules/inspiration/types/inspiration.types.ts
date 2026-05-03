import { isUndefined, omitBy } from "lodash";
import { Types } from "mongoose";
import { IGeneratedSummary } from "../../generatedSummary";

export interface IInspiration {
  _id?: string;
  generatedSummaryId?: IGeneratedSummary | string;
  category?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Inspiration implements IInspiration {
  _id?: string;
  generatedSummaryId?: IGeneratedSummary | string;
  category?: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(input?: IInspiration) {
    this._id = input._id
      ? input._id.toString()
      : new Types.ObjectId().toString();
    this.generatedSummaryId = input.generatedSummaryId;
    this.category = input.category;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }

  toJSON(): IInspiration {
    return omitBy(this, isUndefined) as IInspiration;
  }
}
