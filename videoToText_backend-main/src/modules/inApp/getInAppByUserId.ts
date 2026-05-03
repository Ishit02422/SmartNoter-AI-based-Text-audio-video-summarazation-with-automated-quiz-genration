import { inAppModel } from "./schema";

/**
 *
 * @returns all inApp records | empty array
 */
export const getInAppByUserId = async (userId: string) => {
  const inApp = await inAppModel.find({ userId }).sort({ createdAt: -1 });
  return inApp;
};
