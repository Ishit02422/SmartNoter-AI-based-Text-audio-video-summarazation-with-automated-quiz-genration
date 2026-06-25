"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFeedbackByUserId = void 0;
const schema_1 = require("./schema");
/**
 *
 * @param _id user id
 * @returns relevant feedback record | null
 */
const getFeedbackByUserId = async (_id) => {
    const feedback = await schema_1.FeedbackModel.findOne({ userId: _id }).lean();
    //   .populate({
    //     path: "userId",
    //   });
    return feedback ? feedback : null;
};
exports.getFeedbackByUserId = getFeedbackByUserId;
//# sourceMappingURL=getFeedbackByUserId.js.map