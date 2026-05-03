import { User } from ".";
import { UserModel } from "./schema";

/**
 *
 * @param _id user id
 * @returns relevant user record | null
 */
export const getAllUserForNotification = async () => {
  const user = await UserModel.find().select(
    "FCMToken"
  );  
  return user ? user.map((item) => new User(item)) : null;
};
