import { User } from ".";
import { UserModel } from "./schema";

/**
 *
 * @param email user email
 * @returns null or User class
 */
export const getUserByFirebaseUserId = async (firebaseId: string) => {
  const user = await UserModel.findOne({ firebaseUserId: firebaseId });
  return user ? new User(user) : null;
};
