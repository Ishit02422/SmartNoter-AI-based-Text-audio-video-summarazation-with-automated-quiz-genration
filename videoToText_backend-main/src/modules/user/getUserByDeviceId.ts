import { UserModel } from "./schema";

/**
 *
 * @param deviceId 
 * @returns relevant user record | null
 */
export const getUserByDeviceId = async (deviceId: string) => {
  const user = await UserModel.findOne({deviceId});
  return user ? user : null;
};
