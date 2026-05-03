import { UserModel } from "./schema";

export const saveFCMToken = async (userId: string, fcmToken: string) => {
  try {
    const savedFCM = await UserModel.findByIdAndUpdate(
      userId,
      { $addToSet: { FCMToken: fcmToken } },
      { new: true, upsert: true }
    );
    // const FCMTokenExists = await isFCMTokenExists(userId);
    // if (FCMTokenExists) {
    //   token = await updateFCMToken(userId, fcmToken);
    // } else {
    //   token = await createFCMToken(userId, fcmToken);
    // }
    return savedFCM;
  } catch (error) {
    console.log("Error in saveFCMToken service: ", error);
    throw new Error("Error in saveFCMToken service");
  }
};
