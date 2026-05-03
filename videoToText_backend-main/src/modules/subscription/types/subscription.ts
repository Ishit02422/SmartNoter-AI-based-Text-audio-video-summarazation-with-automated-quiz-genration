import { Types } from "mongoose";
import { IUser } from "../../user";
import { isNil, isUndefined, omitBy } from "lodash";

export interface ISubscription {
  _id: Types.ObjectId;
  Coins: number;
  receiptId: string;
  userId: string | IUser;
  data: string;
  deviceId: string;
  appType: string;
  price: string;
  store: string;
  purchase: string;
  expiredTime?: string;
  subscriptionType?: string;
  originalTransactionId?: string;
  detail?: object;
  createdAt: Date;
  updatedAt: Date;
}

export class Subscription implements ISubscription {
  _id: Types.ObjectId;
  Coins: number;
  receiptId: string;
  userId: string | IUser;
  data: string;
  deviceId: string;
  appType: string;
  price: string;
  store: string;
  purchase: string;
  expiredTime?: string;
  subscriptionType?: string;
  originalTransactionId?: string;
  detail?: object;
  createdAt: Date;
  updatedAt: Date;
  
  constructor(input?: ISubscription) {
    this._id = input?._id;
    this.Coins = input?.Coins ?? 0;
    this.receiptId = input?.receiptId ?? "";
    this.userId = input?.userId ?? "";
    this.data = input?.data ?? "";
    this.deviceId = input?.deviceId ?? "";
    this.appType = input?.appType ?? "";
    this.price = input?.price ?? "";
    this.store = input?.store ?? "";
    this.purchase = input?.purchase ?? "";
    this.expiredTime = input?.expiredTime;
    this.subscriptionType = input?.subscriptionType;
    this.originalTransactionId = input?.originalTransactionId;
    this.detail = input?.detail ?? {};
    this.createdAt = input?.createdAt ? new Date(input.createdAt) : new Date();
    this.updatedAt = input?.updatedAt ? new Date(input.updatedAt) : new Date();
  }

  toJSON() {
    return omitBy(this, isUndefined) as ISubscription;
  }

  toComparable(): ISubscription {
    return omitBy(this, isNil) as ISubscription;
  }
}
