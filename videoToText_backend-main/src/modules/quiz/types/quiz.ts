import { isNil, isUndefined, omitBy } from "lodash";
import { Types } from "mongoose";
import { IUser } from "../../user";
type OptionType = {
  A?: string;
  B?: string;
  C?: string;
  D?: string;
};
export interface IQuiz {
  _id?: string | Types.ObjectId;
  source?: string;
  summaryId?: string | Types.ObjectId;
  que?: string;
  options?: OptionType;
  correctOption?: string;
  resultStatus?: string;
  userId?: IUser;
  isAnswered?: boolean;
  answeredOption?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Quiz implements IQuiz {
  _id?: string | Types.ObjectId;
  source?: string;
  summaryId?: string | Types.ObjectId;
  que?: string;
  options?: OptionType;
  resultStatus?: string;
  isAnswered?: boolean;
  answeredOption?: string;
  correctOption?: string;
  userId?: IUser;
  createdAt?: Date;
  updatedAt?: Date;
  constructor(input?: IQuiz) {
    Object.assign(this, input);
  }
  toJSON() {
    return omitBy(this, isUndefined) as IQuiz;
  }

  toComparable(): IQuiz {
    return omitBy(this, isNil) as IQuiz;
  }
}
