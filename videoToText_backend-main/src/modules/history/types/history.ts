import { Types } from "mongoose";
import { IUser } from "../../user";
import { isNil, isUndefined, omitBy } from "lodash";
export const modelNames = [
  "flashcards",
  "generatedsummaryaudios",
  "generatedsummaryfromwebs",
  "generatedsummaryvideos",
  "generatesummarypdfs",
  "generatedsummaryfromtexts",
  "mindmaps",
  "quizzes",
  "translates",
];
export const getModelByName = {
  FlashCard: "flashcards",
  SummaryAudio: "generatedsummaryaudios",
  SummaryVideo: "generatedsummaryvideos",
  SummaryPDF: "generatesummarypdfs",
  SummaryWeb: "generatedsummaryfromwebs",
  SummaryText: "generatedsummaryfromtexts",
  MindMap: "mindmaps",
  Quiz: "quizzes",
  Translate: "translates",
};
export interface IHistory {
  _id?: string;
  modelName?: string;
  modelId?: Types.ObjectId[];
  userId?: Types.ObjectId | string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class History implements IHistory {
  _id?: string;
  modelName?: string;
  modelId?: Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;

  constructor(input?: IHistory) {
    Object.assign(this, input);
  }

  toJSON() {
    return omitBy(this, isUndefined) as IHistory;
  }

  toComparable(): IHistory {
    return omitBy(this, isNil) as IHistory;
  }
}
