import { User } from ".";
import { UserModel } from "./schema";

/**
 *
 * @param _id user id
 * @returns relevant user record | null
 */
export const getAllUser = async () => {
  const user = await UserModel.find().select(
    "firstName lastName email isAppleLogin isGoogleLogin isFacebookLogin isGuestLogin glitter deviceId createdAt updatedAt"
  );
  return user ? user.map((item) => new User(item)) : null;
};
