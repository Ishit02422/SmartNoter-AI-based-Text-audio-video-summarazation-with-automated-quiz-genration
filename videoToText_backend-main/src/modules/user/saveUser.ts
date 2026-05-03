import { User } from ".";
import { UserModel } from "./schema";

/**
 * 
 * @param user user class
 * @returns created user
 */
export const saveUser = async (user: User) => {
 const savedUser = await new UserModel(user.toJSON()).save();
  return savedUser;
};
