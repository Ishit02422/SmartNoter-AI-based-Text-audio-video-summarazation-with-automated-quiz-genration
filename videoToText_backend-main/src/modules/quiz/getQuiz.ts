import { Types } from "mongoose";
import { QuizModel } from "./schema";
/**
 *
 * @param source
 * @param summaryId
 * @param userId
 * @returns quizes
 */
export const getQuiz = async (
  source: string,
  summaryId: string,
  userId: string | Types.ObjectId
) => {
  const quizes = await QuizModel.find({ source, summaryId, userId })
    .sort({
      createdAt: 1,
    })
    .lean();
  return quizes;
};
