"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFeedback = void 0;
const schema_1 = require("./schema");
/**
 *
 * @param Feedback
 * @returns update Feedback record
 */
const updateFeedback = async (feedback) => {
    await schema_1.FeedbackModel.findByIdAndUpdate(feedback._id, feedback.toJSON());
    return feedback;
};
exports.updateFeedback = updateFeedback;
//# sourceMappingURL=updateFeedback.js.map