import { Types } from "mongoose";
import { IUser } from "../../user";
import { isNil, isUndefined, omitBy } from "lodash";

export interface IReward {
  _id?: Types.ObjectId | string;
  type?: string;
  token?: number; //how many times refers to another persons
  status?: string;
  userId?: IUser | Types.ObjectId;
  credit?: number;
  postLink?: string;
  rewardBy?: IUser | Types.ObjectId | string;
  refersUser?: IUser[] | Types.ObjectId[];
  referralCode?: string;
  count?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Reward implements IReward {
  _id?: Types.ObjectId | string;
  type?: string;
  token?: number; //how many times refers to another persons
  status?: string;
  userId?: IUser | Types.ObjectId;
  count?: number;
  credit?: number;
  rewardBy?: IUser | Types.ObjectId | string;
  refersUser?: IUser[] | Types.ObjectId[];
  referralCode?: string;
  createdAt?: Date;
  updatedAt?: Date;
  constructor(input?: IReward) {
    Object.assign(this, input);
  }
  toJSON() {
    return omitBy(this, isUndefined) as IReward;
  }

  toComparable(): IReward {
    return omitBy(this, isNil) as IReward;
  }
}
