import { FilterQuery, Types } from "mongoose";
import { IReward, Reward } from "./types";
import { RewardModel } from "./schema";
type updateQuery<T> = {
  $set?: Partial<T>;
  $inc?: Partial<Record<keyof T, number>>;
  $push?: Partial<Record<keyof T, any>>;
  $pull?: Partial<Record<keyof T, any>>;
  $addToSet?: Partial<Record<keyof T, any>>;
  $unset?: Partial<Record<keyof T, any>>;
};

export const updateReward = async (
  id: string | Types.ObjectId,
  data: IReward
) => {
  const saved = await RewardModel.findByIdAndUpdate(id, data, {
    new: true,
    upsert: true,
  });

  return saved;
};
