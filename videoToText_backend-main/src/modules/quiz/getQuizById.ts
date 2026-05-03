import { Types } from "mongoose";
import { QuizModel } from "./schema";
import { IQuiz } from "./types";

/**
 *
 * @param quizId
 * @param userId
 * @returns quiz
 */
export const getQuizById = async (
  quizId: Types.ObjectId,
  userId: Types.ObjectId | string
) => {
  const quiz = await QuizModel.findOne({ _id: quizId, userId });
  return quiz;
};
