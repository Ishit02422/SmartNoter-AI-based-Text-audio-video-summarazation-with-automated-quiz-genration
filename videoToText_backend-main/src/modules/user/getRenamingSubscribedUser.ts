import { UserModel } from "./schema";

/**
 *
 * @returns all inApp records | empty array
 */
export const getRenamingSubscribedUser = async (isProUser: boolean) => {
  const inApp = await UserModel.find({ isProUser });
  return inApp;
};
