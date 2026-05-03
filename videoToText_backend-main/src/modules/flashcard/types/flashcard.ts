import { isNil, isUndefined, omitBy } from "lodash";
import { Types } from "mongoose";
import { IUser } from "../../user";

export interface IFlashCard {
  _id?: Types.ObjectId;
  source?: string;
  summaryId?: string | Types.ObjectId;
  que?: string;
  imageUrl?: string;
  ans?: string;
  userId?: IUser;
  createdAt?: Date;
  updatedAt?: Date;
}

export class FlashCard implements IFlashCard {
  _id?: Types.ObjectId;
  source?: string;
  summaryId?: string | Types.ObjectId;
  userId?: IUser;
  que?: string;
  imageUrl?: string;
  ans?: string;
  createdAt?: Date;
  updatedAt?: Date;
  constructor(input?: IFlashCard) {
    Object.assign(this, input);
  }
  toJSON() {
    return omitBy(this, isUndefined) as IFlashCard;
  }

  toComparable(): IFlashCard {
    return omitBy(this, isNil) as IFlashCard;
  }
}
