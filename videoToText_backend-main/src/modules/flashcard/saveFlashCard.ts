import { FlashCardModel } from "./schema";
import { FlashCard, IFlashCard } from "./types";
/**
 *
 * @param flashCard
 * @returns savedCards[]
 */
export const saveFlashCard = async (flashCard: IFlashCard | IFlashCard[]) => {
  const savedCard = await FlashCardModel.create(flashCard);
  return savedCard;
};
