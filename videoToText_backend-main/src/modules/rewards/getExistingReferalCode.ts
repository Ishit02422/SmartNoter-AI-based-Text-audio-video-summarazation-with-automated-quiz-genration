import { Types } from "mongoose";
import { IUser } from "../user";
import { RewardModel } from "./schema";
type qryType = {
    userId: Types.ObjectId | string,
    type: string,
    status?:string
}
export const getExistingReward = async (
  userId: Types.ObjectId | string,
  type: string = "REFER_EARN",
  status?:string
) => {
  const qry:qryType = {
    userId,
    type
  }
  if (status) {
    qry.status = status
  }
  const referalCode = await RewardModel.findOne(qry);
  return referalCode;
};
