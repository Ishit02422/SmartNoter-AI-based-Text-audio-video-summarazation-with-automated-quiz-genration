import { QuizModel } from "./schema";
import { IQuiz } from "./types";

/**
 *
 * @param quizData
 * @returns quiz
 */
export const saveQuiz = async (quizData: IQuiz | IQuiz[]) => {
  const quiz = await QuizModel.create(quizData);
  return quiz;
};
