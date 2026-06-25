"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFeedback = void 0;
const types_1 = require("./types");
const schema_1 = require("./schema");
/**
 *
 * @returns all feedback records | empty array
 */
const getFeedback = async () => {
    const feedback = await schema_1.FeedbackModel.find().sort({ createdAt: -1 });
    return feedback ? feedback.map((item) => new types_1.Feedback(item)) : null;
};
exports.getFeedback = getFeedback;
//# sourceMappingURL=getFeedback.js.map