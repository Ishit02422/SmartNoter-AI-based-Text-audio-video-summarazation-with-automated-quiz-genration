import { Types } from "mongoose";
import { QuizModel } from "./schema";
import { IQuiz } from "./types";

export const answered = async (quiz: IQuiz, answeredOption: string) => {
  const answeredQuiz = await QuizModel.findByIdAndUpdate(
    quiz._id,
    {
      $set: {
        isAnswered: true,
        resultStatus:
          quiz.correctOption === answeredOption.toUpperCase()
            ? "RIGHT"
            : "WRONG",
        answeredOption: answeredOption.toUpperCase(),
      },
    },
    { new: true, upsert: true }
  );
  return answeredQuiz;
};
