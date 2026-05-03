import { Feedback } from "./types";
import { FeedbackModel } from "./schema";

/**
 *
 * @returns all feedback records | empty array
 */
export const getPopulatedFeedback = async () => {
  const feedback = await FeedbackModel.find().populate({path:"userId"});
  return feedback ? feedback.map((item) => new Feedback(item)) : null;
};
