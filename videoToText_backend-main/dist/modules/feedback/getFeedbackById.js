"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFeedbackById = void 0;
const types_1 = require("./types");
const schema_1 = require("./schema");
/**
 *
 * @param _id Feedback id
 * @returns relevant category record | null
 */
const getFeedbackById = async (_id) => {
    const feedback = await schema_1.FeedbackModel.findById(_id);
    return feedback ? new types_1.Feedback(feedback) : null;
};
exports.getFeedbackById = getFeedbackById;
//# sourceMappingURL=getFeedbackById.js.map