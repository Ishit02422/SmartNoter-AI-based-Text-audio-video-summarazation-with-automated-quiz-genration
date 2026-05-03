import { Types } from "mongoose";
import { RewardModel } from "./schema";
type qryType = {
  userId: string | Types.ObjectId;
  type?: string;
};
export const getRewardByUserId = async (
  userId: string | Types.ObjectId,
  type?: string
) => {
  let qry: qryType = { userId };
  if (type) {
    qry.type = type;
  }
  const rewards = await RewardModel.find(qry);
  return rewards;
};
