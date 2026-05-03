import { Types } from "mongoose";
import { GenerateSummyPdfModel } from "./schema";
/**
 * function for check summary data is store in database or not
 * @params summaryId
 * @params userId
 * @returns data
 */
export const checkPdfSummaryIsExistById = async (
  summaryId: string,
  userId: string | Types.ObjectId
) => {
  const data = await GenerateSummyPdfModel.findOne({ _id: summaryId, userId });
  return data;
};
