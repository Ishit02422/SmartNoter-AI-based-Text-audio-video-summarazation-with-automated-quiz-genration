import { RewardModel } from "./schema";

export const getRewardById = async (id:string) => {
  const reward = await RewardModel.findById(id);
  return reward;
};
