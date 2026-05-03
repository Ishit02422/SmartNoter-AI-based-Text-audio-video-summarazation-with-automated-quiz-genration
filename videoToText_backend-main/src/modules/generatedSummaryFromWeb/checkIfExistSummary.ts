import { Types } from "mongoose";
import { GeneratedSummaryWebModel } from "./schema";
/**
 * function for check summary data is store in database or not
 * @params summaryId
 * @params userId
 * @returns data
 */
export const checkWebSummaryIsExistById = async (
  summaryId: string,
  userId: string | Types.ObjectId
) => {
  const data = await GeneratedSummaryWebModel.findOne({
    _id: summaryId,
    userId,
  });
  return data;
};
