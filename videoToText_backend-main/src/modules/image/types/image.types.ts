import { isNil, isUndefined, omitBy } from "lodash";
import { IUser } from "../../user";
import { Types } from "mongoose";

export interface IImage {
  _id?: string;
  description?: string;
  title?: string;
  imageURL?: string;
  thumbnail?: string;
  userId?: string | Types.ObjectId | IUser;
  resolution?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Image implements IImage {
  _id?: string;
  description?: string;
  title?: string;
  url?: string;
  imageURL?: string;
  thumbnail?: string;
  userId?: string | Types.ObjectId | IUser;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(input?: IImage) {
    this._id = input?._id;
    this.description = input?.description;
    this.title = input?.title;
    this.imageURL = input?.imageURL;
    this.thumbnail = input?.thumbnail;
    this.userId = input?.userId;
    this.createdAt = input?.createdAt;
    this.updatedAt = input?.updatedAt;
  }

  toJSON() {
    return omitBy(this, isUndefined) as IImage;
  }

  toComparable(): IImage {
    return omitBy(this, isNil) as IImage;
  }
}
