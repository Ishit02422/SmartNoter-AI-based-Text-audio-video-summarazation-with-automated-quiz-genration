import { Types } from "mongoose";
import { FlashCardModel } from "./schema";
/**
 *
 * @param source
 * @param summaryId
 * @param userId
 * @returns cards
 */
export const getFlashCard = async (
  source: string,
  summaryId: string,
  userId: string | Types.ObjectId
) => {
  const cards = await FlashCardModel.find({ source, summaryId, userId })
    .sort({
      createdAt: 1,
    })
    .lean();
  return cards;
};
