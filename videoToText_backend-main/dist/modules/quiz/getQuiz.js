"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuiz = void 0;
const schema_1 = require("./schema");
/**
 *
 * @param source
 * @param summaryId
 * @param userId
 * @returns quizes
 */
const getQuiz = async (source, summaryId, userId) => {
    const quizes = await schema_1.QuizModel.find({ source, summaryId, userId })
        .sort({
        createdAt: 1,
    })
        .lean();
    return quizes;
};
exports.getQuiz = getQuiz;
//# sourceMappingURL=getQuiz.js.map