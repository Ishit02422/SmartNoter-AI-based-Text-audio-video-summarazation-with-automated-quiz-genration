import { inAppModel } from "./schema";

/**
 *
 * @returns all inApp records | empty array
 */
export const getInAppByTransactionId = async (
  originalTransactionId: string
) => {
  const inApp = await inAppModel.findOne({ originalTransactionId });
  return inApp;
};
