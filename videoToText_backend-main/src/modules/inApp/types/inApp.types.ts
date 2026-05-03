import { isUndefined, omitBy } from "lodash";
import { Types } from "mongoose";
import { IUser } from "../../user";

type IDetail = {
  environment?: string;
  latestData?: string;
  latestReceipt?: string;
};
export interface IInApp {
  _id?: string;
  glitter?: number;
  receiptId?: string;
  userId?: Types.ObjectId | string | IUser;
  data?: string;
  deviceId?: string;
  appType?: string;
  premiumType?: string;
  price?: string;
  store?: string;
  purchase?: string;
  detail?: IDetail;
  createdAt?: Date;
  updatedAt?: Date;
}

export class InApp implements IInApp {
  _id?: string;
  glitter?: number;
  receiptId?: string;
  userId?: Types.ObjectId | string | IUser;
  data?: string;
  deviceId?: string;
  premiumType?: string;
  appType?: string;
  price?: string;
  store?: string;
  purchase?: string;
  detail?: IDetail;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(input?: IInApp) {
    this._id = input?._id
      ? input?._id.toString()
      : new Types.ObjectId().toString();
    this.receiptId = input?.receiptId;
    this.userId = input?.userId;
    this.deviceId = input?.deviceId;
    this.premiumType = input?.premiumType;
    this.data = input?.data;
    this.appType = input?.appType;
    this.detail = input?.detail;
    this.price = input?.price;
    this.store = input?.store;
    this.purchase = input?.purchase;
    this.createdAt = input?.createdAt;
    this.updatedAt = input?.updatedAt;
    this.glitter = input?.glitter;
  }

  static adminTypes = ["ADMIN", "SUPER ADMIN"];

  toJSON(): IInApp {
    return omitBy(this, isUndefined) as IInApp;
  }
}
