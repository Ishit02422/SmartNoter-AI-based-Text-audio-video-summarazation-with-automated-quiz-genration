import { isNil, isUndefined, omitBy } from "lodash";
import { IUser } from "../../user";
import { Types } from "mongoose";

export interface IAudio {
  _id?: string;
  title?: string;
  url?: string;
  audioURL?: string;
  userId?: string | Types.ObjectId | IUser;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Audio implements IAudio {
  _id?: string;
  title?: string;
  url?: string;
  audioURL?: string;
  userId?: string | Types.ObjectId | IUser;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(input?: IAudio) {
    this._id = input._id;
    this.title = input.title;
    this.url = input.url;
    this.audioURL = input.audioURL;
    this.userId = input.userId;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }

  toJSON() {
    return omitBy(this, isUndefined) as IAudio;
  }

  toComparable(): IAudio {
    return omitBy(this, isNil) as IAudio;
  }
}
