import { Types } from "mongoose";
import { IUser } from "../../user";

export interface IChatWithAi {
  _id?: string;
  userId?: IUser | Types.ObjectId;
  contextId?: Types.ObjectId; //this id is from [generatedsummaryfromaudios,generatedsummaryfrompdfs,generatedsummaryfromyoutubes]
  source?: string; // pdf or audio or video
  messageType?: string; // ai or human
  content?: string; //actual message
  createdAt?: Date;
  updatedAt?: Date;
}
export class ChatWithAI implements IChatWithAi {
  _id?: string;
  userId?: IUser | Types.ObjectId;
  contextId?: Types.ObjectId; //this id is from [generatedsummaryfromaudios,generatedsummaryfrompdfs,generatedsummaryfromyoutubes]
  source?: string; // pdf or audio or video
  messageType?: string; // ai or human
  content?: string; //actual message
  createdAt?: Date;
  updatedAt?: Date;

  constructor(input?: IChatWithAi) {
    Object.assign(this, input);
  }
}
