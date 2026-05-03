import { Feedback } from "./types";
import { FeedbackModel } from "./schema";

/**
 * 
 * @param Feedback class
 * @returns created category
 */
 export const saveFeedback = async (feedback: Feedback) => {
   const savedFeedback = await new FeedbackModel(feedback.toJSON()).save();
    return savedFeedback;
  };