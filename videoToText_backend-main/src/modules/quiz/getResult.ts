import { Types } from "mongoose";
import { QuizModel } from "./schema";
import { IQuiz } from "./types";

/**
 *
 * @param summaryId
 * @param source
 * @param userId
 * @returns resultQuiz,allQuiz,summary
 */

export const getResult = async (
  summaryId: Types.ObjectId,
  source: string,
  userId: Types.ObjectId | string
) => {
  const summary = null;
  const [resultQuiz, allQuiz] = await Promise.all([
    await QuizModel.aggregate([
      {
        $match: {
          summaryId: new Types.ObjectId(summaryId),
          source,
          userId: new Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: null,
          totalQuizzes: { $sum: 1 },
          answeredCount: {
            $sum: { $cond: [{ $eq: ["$isAnswered", true] }, 1, 0] },
          },
          correctAnswers: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$isAnswered", true] },
                    { $eq: ["$resultStatus", "RIGHT"] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalQuizzes: 1,
          answeredCount: 1,
          unansweredCount: { $subtract: ["$totalQuizzes", "$answeredCount"] },
          correctAnswers: 1,
          percentage: {
            $cond: [
              { $eq: ["$answeredCount", 0] },
              0,
              {
                $multiply: [
                  { $divide: ["$correctAnswers", "$totalQuizzes"] },
                  100,
                ],
              },
            ],
          },
        },
      },
    ]),
    await QuizModel.find({ summaryId, source, userId }),
  ]);
  return { resultQuiz, allQuiz, summary };
};
