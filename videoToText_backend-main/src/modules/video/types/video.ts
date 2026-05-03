import { isNil, isUndefined, omitBy } from "lodash";
import { IUser } from "../../user";
import { Types } from "mongoose";

export interface IVideo {
  _id?: string;
  title?: string;
  url?: string;
  videoURL?: string;
  userId?:string | Types.ObjectId | IUser;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Video implements IVideo {
  _id?: string;
  title?: string;
  url?: string;
  videoURL?: string;
  userId?: string | Types.ObjectId | IUser;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(input?: IVideo) {
    this._id = input._id;
    this.title = input.title;
    this.url = input.url;
    this.videoURL = input.videoURL;
    this.userId = input.userId;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }

  toJSON() {
    return omitBy(this, isUndefined) as IVideo;
  }

  toComparable(): IVideo {
    return omitBy(this, isNil) as IVideo;
  }
}
