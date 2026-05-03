import { Types } from "mongoose";
import { IUser } from "../../user";

export type ISubTopic = {
  subTopic?: string;
  detail?: string;
};
export type ITopic = {
  topic?: string;
  subtopics?: ISubTopic[];
};

export interface IMindMap {
  _id?: string;
  title?: string;
  topics?: ITopic[];
  summaryId?: string | Types.ObjectId;
  source?: string;
  userId?: IUser | string;
  createdAt?: Date;
  updatedAt?: Date;
}
