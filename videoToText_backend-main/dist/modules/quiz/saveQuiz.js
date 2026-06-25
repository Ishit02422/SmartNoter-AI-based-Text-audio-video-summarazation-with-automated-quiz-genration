"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveQuiz = void 0;
const schema_1 = require("./schema");
/**
 *
 * @param quizData
 * @returns quiz
 */
const saveQuiz = async (quizData) => {
    const quiz = await schema_1.QuizModel.create(quizData);
    return quiz;
};
exports.saveQuiz = saveQuiz;
//# sourceMappingURL=saveQuiz.js.map