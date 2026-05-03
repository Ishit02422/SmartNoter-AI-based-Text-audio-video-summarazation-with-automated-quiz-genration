import { RewardModel } from "./schema";
import { Reward } from "./types";
/**
 *
 * @param reward
 * @returns savedReward
 */
export const saveReward = async (reward: Reward) => {
  const savedReward = await new RewardModel(reward.toJSON()).save();
  return savedReward;
};
