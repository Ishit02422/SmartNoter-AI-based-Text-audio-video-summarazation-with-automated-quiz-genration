import { Feedback } from "./types";
import { FeedbackModel } from "./schema";

/**
 *
 * @param _id Feedback id
 * @returns relevant category record | null
 */
export const getFeedbackById = async (_id: string) => {
  const feedback = await FeedbackModel.findById(_id);
  return feedback ? new Feedback(feedback) : null;
};
