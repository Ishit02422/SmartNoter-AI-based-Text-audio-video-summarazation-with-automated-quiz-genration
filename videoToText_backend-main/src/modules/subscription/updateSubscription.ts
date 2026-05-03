import { SubscriptionModel } from "./schema";
import { ISubscription } from "./types";

export const updateSubscription = async (subscription: ISubscription) => {
  await SubscriptionModel.findByIdAndUpdate(subscription._id, subscription);
  return subscription;
};
