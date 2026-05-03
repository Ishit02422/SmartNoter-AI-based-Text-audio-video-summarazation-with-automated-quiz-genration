import { FeedbackModel } from "./schema";

/**
 * will delete Feedback
 * @param _id
 */
export const deleteFeedback = async (_id: string) => {
  await FeedbackModel.findByIdAndDelete(_id);
};
