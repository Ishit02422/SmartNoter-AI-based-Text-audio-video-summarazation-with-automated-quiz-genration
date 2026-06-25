"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveFCMToken = void 0;
const schema_1 = require("./schema");
const saveFCMToken = async (userId, fcmToken) => {
    try {
        const savedFCM = await schema_1.UserModel.findByIdAndUpdate(userId, { $addToSet: { FCMToken: fcmToken } }, { new: true, upsert: true });
        // const FCMTokenExists = await isFCMTokenExists(userId);
        // if (FCMTokenExists) {
        //   token = await updateFCMToken(userId, fcmToken);
        // } else {
        //   token = await createFCMToken(userId, fcmToken);
        // }
        return savedFCM;
    }
    catch (error) {
        console.log("Error in saveFCMToken service: ", error);
        throw new Error("Error in saveFCMToken service");
    }
};
exports.saveFCMToken = saveFCMToken;
//# sourceMappingURL=saveFCMToken.js.map