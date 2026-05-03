import { SubscriptionModel } from "./schema";

export const getSubscriptionByReceiptId = async (receiptId: string) => {
  const subscription = await SubscriptionModel.findOne({ receiptId });
  return subscription;
};