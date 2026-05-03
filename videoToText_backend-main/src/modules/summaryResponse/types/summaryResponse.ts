import { Types } from "mongoose";
import { IUser } from "../../user";

export interface ISummaryResponse {
  _id?: Types.ObjectId;
  response?: string;
  source?: string; //   video/audio/pdf
  userId?: IUser | Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export class SummaryResponse implements ISummaryResponse {
  _id?: Types.ObjectId;
  response?: string;
  source?: string; //   video/audio/pdf
  userId?: IUser | Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  constructor(input?: ISummaryResponse) {
    Object.assign(this, input);
  }
}
