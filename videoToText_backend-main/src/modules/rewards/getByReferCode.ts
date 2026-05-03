import { RewardModel } from "./schema";

export const getByReferCode = async (referralCode: string, type?: string) => {
  const reward = await RewardModel.findOne({ referralCode, type });
  return reward;
};
