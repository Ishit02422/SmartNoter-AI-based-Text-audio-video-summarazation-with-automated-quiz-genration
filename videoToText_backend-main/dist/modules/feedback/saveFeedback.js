"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveFeedback = void 0;
const schema_1 = require("./schema");
/**
 *
 * @param Feedback class
 * @returns created category
 */
const saveFeedback = async (feedback) => {
    const savedFeedback = await new schema_1.FeedbackModel(feedback.toJSON()).save();
    return savedFeedback;
};
exports.saveFeedback = saveFeedback;
//# sourceMappingURL=saveFeedback.js.map