import { inAppModel } from "./schema";
import { InApp } from "./types";

/**
 *
 * @returns all inApp records | empty array
 */
export const getInAppByReceiptId = async (receiptId: string) => {
  const inApp = await inAppModel.findOne({ receiptId });
  return inApp;
};
