import { Types } from "mongoose";
import { GeneratedSummaryTextModel } from "./schema";
/**
 * function for check summary data is store in database or not
 * @params summaryId
 * @params userId
 * @returns data
 */
export const checkTextSummaryIsExistById = async (
  summaryId: string,
  userId: string | Types.ObjectId
) => {
  const data = await GeneratedSummaryTextModel.findOne({
    _id: summaryId,
    userId,
  });
  return data;
};
