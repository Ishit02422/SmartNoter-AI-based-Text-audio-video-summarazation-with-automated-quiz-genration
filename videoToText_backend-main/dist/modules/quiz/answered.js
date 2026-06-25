"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.answered = void 0;
const schema_1 = require("./schema");
const answered = async (quiz, answeredOption) => {
    const answeredQuiz = await schema_1.QuizModel.findByIdAndUpdate(quiz._id, {
        $set: {
            isAnswered: true,
            resultStatus: quiz.correctOption === answeredOption.toUpperCase()
                ? "RIGHT"
                : "WRONG",
            answeredOption: answeredOption.toUpperCase(),
        },
    }, { new: true, upsert: true });
    return answeredQuiz;
};
exports.answered = answered;
//# sourceMappingURL=answered.js.map