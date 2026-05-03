import { Feedback } from "./types";
import { FeedbackModel } from "./schema";

/**
 *
 * @param _id user id
 * @returns relevant feedback record | null
 */
export const getFeedbackByUserId = async (_id: string) => {
  const feedback = await FeedbackModel.findOne({ userId: _id }).lean();
  //   .populate({
  //     path: "userId",
  //   });
  return feedback ? feedback : null;
};
