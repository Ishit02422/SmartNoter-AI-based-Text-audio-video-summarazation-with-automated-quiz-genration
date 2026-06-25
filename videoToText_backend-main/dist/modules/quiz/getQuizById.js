"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuizById = void 0;
const schema_1 = require("./schema");
/**
 *
 * @param quizId
 * @param userId
 * @returns quiz
 */
const getQuizById = async (quizId, userId) => {
    const quiz = await schema_1.QuizModel.findOne({ _id: quizId, userId });
    return quiz;
};
exports.getQuizById = getQuizById;
//# sourceMappingURL=getQuizById.js.map