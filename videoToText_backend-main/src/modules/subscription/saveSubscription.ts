import { SubscriptionModel } from "./schema";
import { ISubscription } from "./types";

export const saveSubscription = async (subscription: ISubscription) => {
  await new SubscriptionModel(subscription).save();
  return subscription;
};