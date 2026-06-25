"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFeedback = void 0;
const schema_1 = require("./schema");
/**
 * will delete Feedback
 * @param _id
 */
const deleteFeedback = async (_id) => {
    await schema_1.FeedbackModel.findByIdAndDelete(_id);
};
exports.deleteFeedback = deleteFeedback;
//# sourceMappingURL=deleteFeedback.js.map