"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPopulatedFeedback = void 0;
const types_1 = require("./types");
const schema_1 = require("./schema");
/**
 *
 * @returns all feedback records | empty array
 */
const getPopulatedFeedback = async () => {
    const feedback = await schema_1.FeedbackModel.find().populate({ path: "userId" });
    return feedback ? feedback.map((item) => new types_1.Feedback(item)) : null;
};
exports.getPopulatedFeedback = getPopulatedFeedback;
//# sourceMappingURL=getPopulatedFeedback.js.map