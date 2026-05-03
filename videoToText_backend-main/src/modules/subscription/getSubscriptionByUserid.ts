import { SubscriptionModel } from "./schema";

export const getSubscriptionByUserId = async (userId: string) => {
  const subscription = await SubscriptionModel.find({ userId }).sort({ createdAt: -1 });
  return subscription;
};