import { omit } from "lodash";
import { IUser, User } from ".";
import { UserModel } from "./schema";
import { Types } from "mongoose";
import { getTotalSummaryCountByUserId } from "../history";

/**
 *
 * @param _id user id
 * @returns return populated account
 */
export const getPopulatedUserById = async (_id: string | Types.ObjectId) => {
  const [user, totalSummaries] = await Promise.all([
    UserModel.findById(_id).select("-password").populate({
      path: "profileImage",
    }).lean(),
    getTotalSummaryCountByUserId(_id)
  ]);

  if (!user) return null;

  return new User({
    ...(omit(user, ["RESETToken"]) as any),
    totalSummaries
  });
};
