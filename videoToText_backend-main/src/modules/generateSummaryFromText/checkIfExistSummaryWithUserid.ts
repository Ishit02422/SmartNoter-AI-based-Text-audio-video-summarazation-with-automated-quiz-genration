import { Types } from "mongoose";
import { GeneratedSummaryTextModel } from "./schema";
/**
 * function for check summary data is store in database or not
 * @params userId
 * @returns data
 */
export const checkIfExistSummaryWithUserid = async (
  userId: string | Types.ObjectId
) => {
  const data = await GeneratedSummaryTextModel.findOne({
    userId,
  });
  return data;
};
