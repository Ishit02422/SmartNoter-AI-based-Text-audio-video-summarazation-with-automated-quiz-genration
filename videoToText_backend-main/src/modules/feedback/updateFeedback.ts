import { Feedback } from "./types";
import { FeedbackModel } from "./schema";

/**
 *
 * @param Feedback
 * @returns update Feedback record
 */
export const updateFeedback = async (feedback: Feedback) => {
  await FeedbackModel.findByIdAndUpdate(feedback._id, feedback.toJSON());
  return feedback;
};
