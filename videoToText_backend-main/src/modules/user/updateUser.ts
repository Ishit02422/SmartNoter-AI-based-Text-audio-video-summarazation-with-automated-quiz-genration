import { FilterQuery } from "mongoose";
import { IUser, User } from ".";
import { UserModel } from "./schema";

/**
 *
 * @param user
 * @returns update user record
 */
export const updateUser = async (user:any) => {
  await UserModel.findByIdAndUpdate(user._id, user.toJSON());
  return user;
};
type UpdateOperators<T> = {
  $set?: Partial<T>;
  $inc?: Partial<Record<keyof T, number>>;
  $push?: Partial<Record<keyof T, any>>;
  $pull?: Partial<Record<keyof T, any>>;
  $unset?: Partial<Record<keyof T, any>>;
};

export const updateUserByQry = async ({
  query,
  update,
}: {
  query: FilterQuery<IUser>;
  update: Partial<IUser> & UpdateOperators<IUser>;
}) => {
  return await UserModel.findOneAndUpdate(query, update, {
    new: true,
    upsert: true,
  });
};
