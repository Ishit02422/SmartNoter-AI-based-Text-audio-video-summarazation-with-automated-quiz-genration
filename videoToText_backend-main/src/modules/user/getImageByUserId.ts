import { IUser, User } from ".";
import { UserModel } from "./schema";

export const getImageByUserId = async (userId: string) => {
  const user = await UserModel.findById(userId).select("-password").populate({
    path: "profileImage",
  });

  return user;
};
