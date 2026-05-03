import { Types } from "mongoose";
import { GeneratedSummaryAudioModel } from "./schema";
/**
 * function for check summary data is store in database or not
 * @params summaryId
 * @params userId
 * @returns data
 */
export const checkAudioSummaryIsExistById = async (
  summaryId: string,
  userId: string | Types.ObjectId
) => {
  const data = await GeneratedSummaryAudioModel.findOne({
    _id: summaryId,
    userId,
  });
  return data;
};
