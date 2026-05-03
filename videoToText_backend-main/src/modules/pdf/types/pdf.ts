import { isNil, isUndefined, omitBy } from "lodash";
import { IUser } from "../../user";
import { Types } from "mongoose";

export interface IPdf {
  _id?: string;
  title?: string;
  url?: string;
  pdfURL?: string;
  userId?: string | Types.ObjectId | IUser;
  createdAt?: Date;
  updatedAt?: Date;
}

export class PDF implements IPdf {
  _id?: string;
  title?: string;
  url?: string;
  pdfURL?: string;
  userId?: string | Types.ObjectId | IUser;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(input?: IPdf) {
    this._id = input._id;
    this.title = input.title;
    this.url = input.url;
    this.pdfURL = input.pdfURL;
    this.userId = input.userId;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }

  toJSON() {
    return omitBy(this, isUndefined) as IPdf;
  }

  toComparable(): IPdf {
    return omitBy(this, isNil) as IPdf;
  }
}
