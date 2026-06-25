"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getResult = void 0;
const mongoose_1 = require("mongoose");
const schema_1 = require("./schema");
/**
 *
 * @param summaryId
 * @param source
 * @param userId
 * @returns resultQuiz,allQuiz,summary
 */
const getResult = async (summaryId, source, userId) => {
    const summary = null;
    const [resultQuiz, allQuiz] = await Promise.all([
        await schema_1.QuizModel.aggregate([
            {
                $match: {
                    summaryId: new mongoose_1.Types.ObjectId(summaryId),
                    source,
                    userId: new mongoose_1.Types.ObjectId(userId),
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
        await schema_1.QuizModel.find({ summaryId, source, userId }),
    ]);
    return { resultQuiz, allQuiz, summary };
};
exports.getResult = getResult;
//# sourceMappingURL=getResult.js.map