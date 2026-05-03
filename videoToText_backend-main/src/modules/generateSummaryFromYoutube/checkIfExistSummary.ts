import { Types } from "mongoose";
import { GeneratedSummaryModel } from "./schema";
/**
 * function for check summary data is store in database or not
 * @params summaryId
 * @params userId
 * @returns data
 */
export const checkVideoSummaryIsExistById = async (
  summaryId: string,
  userId: string | Types.ObjectId
) => {
  const data = await GeneratedSummaryModel.findOne({ _id: summaryId, userId });
  return data;
};
