import { IChatWithAi } from ".";
import { ChatWithAiModel } from "./schema";
/**
 * function for save chat in db
 * @param chat
 * @returns chat itself
 */
export const saveChat = async (chat: IChatWithAi | IChatWithAi[]) => {
  const savedChat = await ChatWithAiModel.create(chat);
  return savedChat;
};
