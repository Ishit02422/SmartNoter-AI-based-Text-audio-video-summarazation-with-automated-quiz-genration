import { isUndefined, omitBy } from "lodash";
import { Types } from "mongoose";
import { IUser } from "../../user";

export interface IFeedback {
  _id?: string;
  //feedback: { question: string; answer: string }[];
  email?: string;
  deviceId?: string;
  appVersion?: string;
  deviceName?: string;
  deviceVersion?: string;
  location?: string;
  option1?: string;
  option2?: string;
  option3?: string;
  option4?: string;
  comment?: string;
  buildNumber?: string;
  userId?: string | IUser;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Feedback implements IFeedback {
  _id?: string;
  //feedback: { question: string; answer: string }[];
  email?: string;
  deviceId?: string;
  appVersion?: string;
  deviceName?: string;
  deviceVersion?: string;
  location?: string;
  option1?: string;
  option2?: string;
  option3?: string;
  option4?: string;
  comment?: string;
  buildNumber?: string;
  userId?: string | IUser;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(input: IFeedback) {
    this._id = input?._id
      ? input?._id.toString()
      : new Types.ObjectId().toString();
    // this.feedback = input?.feedback;
    this.email = input?.email;
    this.deviceId = input?.deviceId;
    this.appVersion = input?.appVersion;
    this.deviceName = input?.deviceName;
    this.deviceVersion = input?.deviceVersion;
    this.location = input?.location;
    this.option1 = input?.option1;
    this.option2 = input?.option2;
    this.option3 = input?.option3;
    this.option4 = input?.option4;
    this.comment = input?.comment;
    this.buildNumber = input?.buildNumber;
    this.userId = input?.userId;
    this.createdAt = input?.createdAt;
    this.updatedAt = input?.updatedAt;
  }

  toJSON(): IFeedback {
    return omitBy(this, isUndefined) as IFeedback;
  }
}
