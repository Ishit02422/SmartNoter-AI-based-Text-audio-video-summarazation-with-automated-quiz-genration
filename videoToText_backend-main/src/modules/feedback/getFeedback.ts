import { Feedback } from "./types";
import { FeedbackModel } from "./schema";

/**
 *
 * @returns all feedback records | empty array
 */
export const getFeedback = async () => {
  const feedback = await FeedbackModel.find().sort({ createdAt: -1 });
  return feedback ? feedback.map((item) => new Feedback(item)) : null;
};
