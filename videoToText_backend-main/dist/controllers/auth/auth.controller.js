"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("firebase-admin/auth");
const joi_1 = __importStar(require("joi"));
const lodash_1 = require("lodash");
const sendNotification_1 = require("../../helper/sendNotification");
const user_1 = require("../../modules/user");
const checkIfExistFolderWithUserId_1 = require("../../modules/folders/checkIfExistFolderWithUserId");
const folders_1 = require("../../modules/folders");
const axios_1 = __importDefault(require("axios"));
const image_1 = require("../../modules/image");
const transferData_1 = require("../../modules/user/transferData");
const getRewardsByUserId_1 = require("../../modules/rewards/getRewardsByUserId");
const schema_1 = require("../../modules/rewards/schema");
const crypto_js_1 = require("crypto-js");
const createTextSummaryDefault_1 = require("../../modules/generateSummaryFromText/createTextSummaryDefault");
const mongoose_1 = require("mongoose");
const checkIfExistSummaryWithUserid_1 = require("../../modules/generateSummaryFromText/checkIfExistSummaryWithUserid");
class Controller {
    constructor() {
        this.loginWithGoogleSchema = joi_1.default.object({
            firstName: joi_1.default.string().optional(),
            lastName: joi_1.default.string().optional(),
            username: joi_1.default.string().optional(),
            email: joi_1.default.string().email().required(),
            firebaseUserId: joi_1.default.string().required(),
            pushToken: joi_1.default.string().required(),
            deviceId: joi_1.default.string().optional(),
            deviceType: joi_1.default.string().optional(),
            profileImage: joi_1.default.string().optional(),
            userId: joi_1.default.string().optional().allow(""),
        });
        this.loginWithAppleSchema = joi_1.default.object({
            firstName: joi_1.default.string().optional().allow(""),
            lastName: joi_1.default.string().optional().allow(""),
            username: joi_1.default.string().optional(),
            email: joi_1.default.string().email().optional().allow(""),
            firebaseUserId: joi_1.default.string().required(),
            // phoneNumber: Joi.string().required(),
            pushToken: joi_1.default.string().required(),
            profileImage: joi_1.default.string().optional(),
            deviceId: joi_1.default.string().optional(),
            deviceType: joi_1.default.string().optional(),
            userId: joi_1.default.string().optional().allow(""),
        });
        this.duplicateSchema = joi_1.default.object({
            email: joi_1.default.string()
                .email()
                .required()
                .external(async (v) => {
                const user = (await (0, user_1.getUserByEmail)(v));
                if (user) {
                    throw new Error("This email address is already associated with another account. Please use a different email address.");
                }
                return v;
            }),
        });
        this.guestSchema = joi_1.default.object({
            firstName: joi_1.default.string().optional(),
            lastName: joi_1.default.string().optional(),
            username: joi_1.default.string().optional(),
            deviceId: joi_1.default.string().required(),
            pushToken: joi_1.default.string().required(),
            deviceType: joi_1.default.string().required(),
            profileImage: joi_1.default.string().optional(),
            firebaseUserId: joi_1.default.string().optional(),
            userId: joi_1.default.string().optional().allow(""),
        });
        this.generateName = async () => {
            const { customAlphabet } = await Promise.resolve().then(() => __importStar(require("nanoid")));
            const random_name = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 11);
            return random_name;
        };
        this.duplicate = async (req, res) => {
            try {
                const payloadValue = await this.duplicateSchema
                    .validateAsync(req.body)
                    .then((value) => {
                    return value;
                })
                    .catch((e) => {
                    console.log(e);
                    if ((0, joi_1.isError)(e)) {
                        res.status(422).json(e);
                    }
                    else {
                        res.status(422).json({ message: e.message });
                    }
                });
                if (!payloadValue) {
                    return;
                }
                return res.status(200).json({ message: "Success" });
            }
            catch (error) {
                console.log("error in login", error);
                return res.status(500).json({
                    message: "Something happened wrong try again after sometime.",
                    error: (0, lodash_1.get)(error, "message"),
                });
            }
        };
        //old code for google login
        // protected readonly loginWithGoogle = async (req: Request, res: Response) => {
        //   try {
        //     if (this.loginWithGoogleSchema.validate(req.body).error) {
        //       return res
        //         .status(422)
        //         .json(this.loginWithGoogleSchema.validate(req.body).error);
        //     }
        //     const payloadValue = this.loginWithGoogleSchema.validate(req.body).value;
        //     if (payloadValue.deviceId) {
        //       const guestUser = await getUserByDeviceId(payloadValue.deviceId);
        //       if (!guestUser) {
        //         return res.status(422).json({
        //           message: "Invalid deviceId",
        //         });
        //       }
        //       guestUser.FCMToken = [];
        //       const userId = guestUser._id;
        //       const isExist = await checkFolderExistsWithUserId(userId);
        //       if (!isExist) {
        //         await createFolder(userId, { folderName: "All Notes" });
        //       }
        //       await updateUser(new User(guestUser));
        //     }
        //     // Build Firebase credential with the Google ID token.;
        //     getAuth()
        //       .verifyIdToken(req.headers["google-id-token"] as string)
        //       .then(async (result) => {
        //         const firebaseUser = result;
        //         //check google token email with given email
        //         if (
        //           (firebaseUser.email !== payloadValue.email,
        //           firebaseUser.uid !== payloadValue.firebaseUserId)
        //         ) {
        //           return res.status(500).json({
        //             message: "Something happened wrong try again after sometime.",
        //           });
        //         }
        //         let user = await getUserByFirebaseUserId(firebaseUser.uid);
        //         if (!user) {
        //           user = await getUserByEmail(payloadValue.email);
        //         }
        //         let isRegistered = true;
        //         const isExist = await checkFolderExistsWithUserId(user._id);
        //         if (!isExist) {
        //           await createFolder(user._id, { folderName: "All Notes" });
        //         }
        //         if (!user) {
        //           user = await saveUser(
        //             new User({
        //               ...User.defaults,
        //               ...payloadValue,
        //               FCMToken: [payloadValue.pushToken],
        //               // profileURL: data.shortLink,
        //               isGoogleLogin: true,
        //               isEmailVerified: true,
        //               glitter: 3,
        //               deviceId: "",
        //             })
        //           );
        //           let notificationObj = {
        //             tokens: [payloadValue.pushToken],
        //             notification: {
        //               title: "🎉 Sign-up Successful! 🎉",
        //               body: "Welcome to Imagine AI! It's the perfect time to unleash your creativity and bring your ideas to life with Art creation. Start exploring now! You got 3 Glitters free...",
        //             },
        //             data: {
        //               type: "google Sign-up notification",
        //             },
        //           };
        //           await sendNotification(notificationObj);
        //         } else {
        //           if (!user.isGoogleLogin) {
        //             await updateUser(
        //               new User({
        //                 ...user,
        //                 ...payloadValue,
        //                 isGoogleLogin: true,
        //                 firebaseUserId: payloadValue.firebaseUserId,
        //                 // deviceId: "",
        //               })
        //             );
        //           }
        //           if (
        //             user.FCMToken?.indexOf(payloadValue.pushToken) === -1 &&
        //             payloadValue.pushToken
        //           ) {
        //             let tokenArr = user.FCMToken;
        //             tokenArr.push(req.body.pushToken);
        //             await updateUser(
        //               new User({
        //                 ...user,
        //                 ...payloadValue,
        //                 isGoogleLogin: true,
        //                 FCMToken: tokenArr,
        //                 firebaseUserId: payloadValue.firebaseUserId,
        //                 deviceId: "",
        //               })
        //             );
        //           }
        //         }
        //         let populatedUser;
        //         if (user._id) {
        //           populatedUser = await getPopulatedUserById(user._id);
        //         }
        //         const token = jwt.sign(
        //           { id: user._id?.toString() },
        //           process.env.JWT_SECRET as Secret
        //         );
        //         user = null;
        //         return res
        //           .status(200)
        //           .set({ "x-auth-token": token })
        //           .json({ ...populatedUser, isRegistered });
        //       })
        //       .catch((error) => {
        //         console.log("error", "error in login with google", error);
        //         return res.status(422).json({
        //           message: "Something happened wrong try again after sometime.",
        //           error: _get(error, "message"),
        //         });
        //       });
        //   } catch (error) {
        //     console.log(error);
        //     console.log("error", "error in login with google", error);
        //     return res.status(500).json({
        //       message: "Something happened wrong try again after sometime.",
        //       error: _get(error, "message"),
        //     });
        //   }
        // };
        //new code for google login
        // protected loginWithGoogle = async (req: Request, res: Response) => {
        //   const payload = req.body;
        //   const auth_token = req.headers["google-id-token"] as string;
        //   try {
        //     if (this.loginWithGoogleSchema.validate(req.body).error) {
        //       return res
        //         .status(422)
        //         .json(this.loginWithGoogleSchema.validate(req.body).error);
        //     }
        //     const payloadValue = this.loginWithGoogleSchema.validate(req.body).value;
        //     const firebaseUser = await getAuth().verifyIdToken(auth_token);
        //     // let user = await getUser({
        //     //   query: { firebaseUserId: firebaseUser.uid },
        //     // });
        //     let user = await getUserByFirebaseUserId(firebaseUser.uid);
        //     if (!user) {
        //       user = await getUserByEmail(firebaseUser.email);
        //     }
        //     if (!user) {
        //       const newUser = new UserModel({
        //         ...payloadValue,
        //         deviceId: "",
        //         email: firebaseUser.email,
        //         firebaseUserId: firebaseUser.uid,
        //         isGoogleLogin: true,
        //       });
        //       user = await saveUser(newUser);
        //       const isExist = await checkFolderExistsWithUserId(user._id);
        //       if (!isExist) {
        //         await createFolder(user._id, { folderName: "All Notes" });
        //       }
        //       if (firebaseUser.picture) {
        //         const response = await axios.get(firebaseUser.picture, {
        //           responseType: "arraybuffer",
        //         });
        //         const profileImage = await uploadMediaToS3(
        //           "profileImage",
        //           response.data,
        //           "image/png",
        //           "image.png"
        //         );
        //         const image = new Image({
        //           userId: user._id.toString(),
        //           imageURL: profileImage.url,
        //           title: "ProfileImage",
        //         });
        //         const img = await saveImage(image);
        //         const updatedUsrClass = new User({
        //           _id: user._id.toString(),
        //           profileImage: img._id,
        //         });
        //         await updateUser(updatedUsrClass);
        //       }
        //       let notificationObj = {
        //         tokens: [payload.FCMToken],
        //         notification: {
        //           title: "🎉 Sign-up Successful! 🎉",
        //           body: "Welcome to AI Homework! 🤖 Start a fascinating chat with AI! Ask anything and see the magic unfold. Start exploring now!. Start exploring now! You got 5 Credit free...",
        //         },
        //         data: {
        //           type: "google Sign-up notification",
        //         },
        //       };
        //       await sendNotification(notificationObj);
        //     } else {
        //       await updateUser(
        //         new User({
        //           _id: user._id.toString(),
        //           deviceId: "",
        //           deviceType: payloadValue.deviceType ?? "",
        //           isGoogleLogin: true,
        //         })
        //       );
        //     }
        //     if (payload.FCMToken) {
        //       await saveFCMToken(user._id.toString(), payloadValue.FCMToken);
        //     }
        //     const token = jwt.sign(
        //       { id: user._id?.toString() },
        //       process.env.JWT_SECRET as Secret
        //     );
        //     const u = await getPopulatedUserById(user._id.toString());
        //     console.log("user===>>", u, "\n token===>>", token);
        //     res.header("x-auth-token", token);
        //     res.status(StatusCodes.OK).json(u);
        //   } catch (error) {
        //     console.log("error", "error in login with google", error);
        //     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        //       message: "Something happened wrong try again after sometime.",
        //     });
        //   }
        // };
        this.loginWithGoogle = async (req, res) => {
            // firstName: Joi.string().optional(),
            //     lastName: Joi.string().optional(),
            //     username: Joi.string().optional(),
            //     email: Joi.string().email().required(),
            //     firebaseUserId: Joi.string().required(),
            //     pushToken: Joi.string().required(),
            //     deviceId: Joi.string().optional(),
            //     deviceType: Joi.string().optional(),
            //     profileImage: Joi.string().optional(),
            //     userId: Joi.string().optional().allow(""),
            try {
                if (this.loginWithGoogleSchema.validate(req.body).error) {
                    return res
                        .status(422)
                        .json(this.loginWithGoogleSchema.validate(req.body).error);
                }
                const payloadValue = this.loginWithGoogleSchema.validate(req.body).value;
                let guestUser = null;
                if (payloadValue.userId) {
                    guestUser = await (0, user_1.getUserById)(payloadValue.userId);
                    guestUser.deviceId = payloadValue.deviceId;
                    await (0, user_1.updateUser)(new user_1.User(guestUser));
                }
                (0, auth_1.getAuth)()
                    .verifyIdToken(req.headers["google-id-token"])
                    .then(async (result) => {
                    const firebaseUser = result;
                    //check google token email with given email
                    if ((firebaseUser.email !== payloadValue.email,
                        firebaseUser.uid !== payloadValue.firebaseUserId)) {
                        return res.status(500).json({
                            message: "Something happened wrong try again after sometime.",
                        });
                    }
                    let user = await (0, user_1.getUserByFirebaseUserId)(firebaseUser.uid);
                    if (!user) {
                        user = await (0, user_1.getUserByEmail)(payloadValue.email);
                    }
                    let isRegistered = true;
                    if (!user) {
                        // console.log(
                        //   "payloadValue in login with google------------------------------------------------------------"
                        // );
                        payloadValue.username =
                            payloadValue.firstName +
                                payloadValue.lastName +
                                Math.floor(Math.random() * (99999 - 10000 + 1)) +
                                10000;
                        const { profileImage, ...restPayload } = payloadValue;
                        const userData = {
                            ...user_1.User.defaults,
                            ...restPayload,
                            FCMToken: payloadValue.pushToken,
                            // profileURL: data.shortLink,
                            isGoogleLogin: true,
                            dailyCredits: guestUser && !guestUser.isTransferred
                                ? guestUser.dailyCredits
                                : 5,
                            deviceId: "",
                        };
                        if (payloadValue.profileImage) {
                            try {
                                const response = await axios_1.default.get(payloadValue.profileImage, {
                                    responseType: "arraybuffer",
                                });
                                let obj = {
                                    buffer: response.data,
                                };
                                const url = await (0, image_1.createAndUploadImage)(obj, "guest-profileImage", "guest profileImage image", null);
                                userData.profileImage = url._id;
                            }
                            catch (imgErr) {
                                console.log("Could not upload profile image, skipping.", imgErr);
                            }
                        }
                        user = await (0, user_1.saveUser)(new user_1.User(userData));
                        user.isCreditEligible = guestUser && !guestUser.isTransferred ? true : false;
                        user.isTransferred = true;
                        user._id = user._id.toString();
                        if (guestUser) {
                            guestUser.isTransferred = true;
                            guestUser.isCreditEligible = false;
                            guestUser.dailyCredits = 0;
                            guestUser._id = guestUser._id.toString();
                            await (0, user_1.updateUser)(guestUser);
                            await (0, transferData_1.transferData)(guestUser, user);
                        }
                        await (0, user_1.updateUser)(new user_1.User(user));
                        const isExist = await (0, checkIfExistFolderWithUserId_1.checkFolderExistsWithUserId)(user._id);
                        if (!isExist) {
                            await (0, folders_1.createFolder)(user._id, { folderName: "All Notes" });
                        }
                        // const isExistSummary = await checkIfExistSummaryWithUserid(
                        //   guestUser._id
                        // );
                        // console.log(isExistSummary);
                        // if (!isExistSummary) await createTextSummaryByDefault(user._id);
                        let notificationObj = {
                            tokens: [payloadValue.pushToken],
                            notification: {
                                title: "🎉 Sign-up Successful! 🎉",
                                body: "🎉 Welcome to SmartNoter! It's the perfect time to unleash your creativity and bring your ideas to life with Upscale creation. Start exploring now...",
                            },
                            data: {
                                type: "google Sign-up notification",
                            },
                        };
                        await (0, sendNotification_1.sendNotification)(notificationObj);
                        // const foundReward = await getRewardByUserId(user._id);
                        // if (!foundReward) {
                        //   const rewardEntry = new RewardModel({
                        //     type: "DAILY_LOGIN",
                        //     token: 0,
                        //     status: "APPROVED",
                        //     userId: user._id,
                        //     diamond: 0,
                        //   });
                        //   await rewardEntry  .save();
                        // }
                        // const foundFollowers = await getFollowingDataByFilter({
                        //   following: guestUser._id,
                        // });
                        // foundFollowers.forEach(async (follow: IFollow) => {
                        //   await updateFollow({ ...follow, following: user._id } as any);
                        // });
                        // const foundFollowings = await getFollowingDataByFilter({
                        //   follower: guestUser._id,
                        // });
                        // foundFollowings.forEach(async (follow: IFollow) => {
                        //   await updateFollow({ ...follow, follower: user._id } as any);
                        // });
                    }
                    else {
                        if (!user.isGoogleLogin) {
                            // console.log("heyyyy++++++++++++++");
                            const { profileImage, ...restPayload } = payloadValue;
                            const userData = {
                                ...user,
                                ...restPayload,
                                isGoogleLogin: true,
                                firebaseUserId: payloadValue.firebaseUserId,
                                deviceId: "",
                            };
                            if (payloadValue.profileImage) {
                                const response = await axios_1.default.get(payloadValue.profileImage, {
                                    responseType: "arraybuffer",
                                });
                                let obj = {
                                    buffer: response.data,
                                };
                                const url = await (0, image_1.createAndUploadImage)(obj, "guest-profileImage", "guest profileImage image", null);
                                userData.profileImage = url._id;
                            }
                            await (0, user_1.updateUser)(new user_1.User(userData));
                        }
                        // if (
                        //   user.FCMToken.indexOf(payloadValue.pushToken) === -1 &&
                        //   payloadValue.pushToken
                        // ) {
                        //   let tokenArr = user.FCMToken;
                        //   tokenArr.push(req.body.pushToken);
                        //   await updateUser(
                        //     new User({
                        //       ...user,
                        //       ...payloadValue,
                        //       FCMToken: tokenArr,
                        //     } as IUser)
                        //   );
                        //   await updateUser(
                        //     new User({
                        //       ...user,
                        //       ...payloadValue,
                        //       isGoogleLogin: true,
                        //       firebaseUserId: payloadValue.firebaseUserId,
                        //     })
                        //   );
                        // }
                        if (user.FCMToken.indexOf(payloadValue.pushToken) === -1 &&
                            payloadValue.pushToken) {
                            // console.log(
                            //   "heyyyy---------------------++++++++++++++++++++",
                            //   user
                            // );
                            let tokenArr = user.FCMToken;
                            tokenArr.push(req.body.pushToken);
                            const { profileImage, ...restPayload } = payloadValue;
                            const userData = {
                                ...user,
                                ...restPayload,
                                FCMToken: tokenArr,
                                isGoogleLogin: true,
                                firebaseUserId: payloadValue.firebaseUserId,
                                firstName: user.firstName,
                                lastName: user.lastName,
                                profileImage: user.profileImage, // Keep existing if present, otherwise handle below
                                email: user.email,
                            };
                            if (!user.profileImage && payloadValue.profileImage) {
                                const response = await axios_1.default.get(payloadValue.profileImage, {
                                    responseType: "arraybuffer",
                                });
                                let obj = {
                                    buffer: response.data,
                                };
                                // const buffer = Buffer.from(response.data);
                                const url = await (0, image_1.createAndUploadImage)(obj, "guest-profileImage", "guest profileImage image", null);
                                userData.profileImage = url._id;
                            }
                            const foundReward = await (0, getRewardsByUserId_1.getRewardByUserId)(user._id);
                            if (!foundReward) {
                                const rewardEntry = new schema_1.RewardModel({
                                    type: "DAILY_LOGIN",
                                    token: 0,
                                    status: "APPROVED",
                                    userId: user._id,
                                    credit: 0,
                                });
                                await rewardEntry.save();
                            }
                            await (0, user_1.updateUser)(new user_1.User(userData));
                        }
                        // if (!user.isGoogleLogin) {
                        // return res.status(422).json({
                        //   message:
                        //     "This email address is already associated with another account. Please use a different email address.",
                        // });
                        // return;
                        // }
                        // if (!user.isGoogleLogin && user.password === "") {
                        //   await updateUser(new User({ ...user, isGoogleLogin: true })); // get user with populated accounts
                        // }
                    }
                    const populatedUser = await (0, user_1.getPopulatedUserById)(user._id);
                    const token = crypto_js_1.AES.encrypt(user._id.toString(), process.env.AES_KEY).toString();
                    return res
                        .cookie("auth", token, {
                        expires: new Date("12/31/2100"),
                        signed: true,
                    })
                        .status(200)
                        .set({ "x-auth-token": token })
                        .json({ ...populatedUser, isRegistered });
                })
                    .catch((error) => {
                    console.log("error", "error in login with google", error);
                    return res.status(422).json({
                        message: "Something happened wrong try again after sometime.",
                        error: (0, lodash_1.get)(error, "message"),
                    });
                });
            }
            catch (error) {
                console.log(error);
                console.log("error", "error in login with google", error);
                return res.status(500).json({
                    message: "Something happened wrong try again after sometime.",
                    error: (0, lodash_1.get)(error, "message"),
                });
            }
        };
        //old code for apple login
        // protected readonly loginWithApple = async (req: Request, res: Response) => {
        //   try {
        //     if (this.loginWithAppleSchema.validate(req.body).error) {
        //       return res
        //         .status(422)
        //         .json(this.loginWithAppleSchema.validate(req.body).error);
        //     }
        //     let payloadValue = this.loginWithAppleSchema.validate(req.body).value;
        //     if (payloadValue.deviceId) {
        //       const guestUser = await getUserByDeviceId(payloadValue.deviceId);
        //       if (!guestUser) {
        //         return res.status(422).json({
        //           message: "Invalid deviceId",
        //         });
        //       }
        //       guestUser.FCMToken = [];
        //       const isExist = await checkFolderExistsWithUserId(guestUser._id);
        //       if (!isExist) {
        //         await createFolder(guestUser._id, { folderName: "All Notes" });
        //       }
        //       await updateUser(new User(guestUser));
        //     }
        //     // Build Firebase credential with the Google ID token.
        //     // Sign in with credential from the Google user.
        //     getAuth()
        //       .verifyIdToken(req.headers["apple-id-token"] as string)
        //       .then(async (result) => {
        //         let firebaseUser = result;
        //         //check google token email with given email
        //         if (
        //           (firebaseUser.email !== payloadValue.email,
        //           firebaseUser.uid !== payloadValue.firebaseUserId)
        //         ) {
        //           return res.status(500).json({
        //             message: "Something happened wrong try again after sometime.",
        //           });
        //         }
        //         let user = await getUserByFirebaseUserId(firebaseUser.uid);
        //         if (!user) {
        //           user = await getUserByEmail(payloadValue.email);
        //         }
        //         let isRegistered = true;
        //         if (!user) {
        //           payloadValue.firstName = "User";
        //           payloadValue.lastName =
        //             Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000;
        //           user = await saveUser(
        //             new User({
        //               ...User.defaults,
        //               ...payloadValue,
        //               FCMToken: [payloadValue.pushToken],
        //               isAppleLogin: true,
        //               isEmailVerified: true,
        //               glitter: 3,
        //               deviceId: "",
        //             })
        //           );
        //           let notificationObj = {
        //             tokens: [payloadValue.pushToken],
        //             notification: {
        //               title: "🎉 Sign-up Successful! 🎉",
        //               body: "Welcome to Imagine AI! It's the perfect time to unleash your creativity and bring your ideas to life with Art creation. Start exploring now! You got 3 Glitters free...",
        //             },
        //             data: {
        //               type: "google Sign-up notification",
        //             },
        //           };
        //           await sendNotification(notificationObj);
        //           isRegistered = false;
        //         } else {
        //           if (!user.isAppleLogin) {
        //             payloadValue = null;
        //             user = null;
        //             return res.status(422).json({
        //               message:
        //                 "This email address is already associated with another account. Please use a different email address.",
        //             });
        //           }
        //           // if (!user.isGoogleLogin && user.password === "") {
        //           //   await updateUser(new User({ ...user, isGoogleLogin: true })); // get user with populated accounts
        //           // }
        //         }
        //         const isExist = await checkFolderExistsWithUserId(user._id);
        //         if (!isExist) {
        //           await createFolder(user._id, { folderName: "All Notes" });
        //         }
        //         let populatedUser;
        //         if (user._id) {
        //           populatedUser = await getPopulatedUserById(user._id);
        //         }
        //         const token = jwt.sign(
        //           { id: user._id?.toString() },
        //           process.env.JWT_SECRET as Secret
        //         );
        //         payloadValue = null;
        //         user = null;
        //         return res
        //           .status(200)
        //           .set({ "x-auth-token": token })
        //           .json({ ...populatedUser, isRegistered });
        //       })
        //       .catch((error) => {
        //         console.log("error", "error in login with apple", error);
        //         return res.status(422).json({
        //           message: "Something happened wrong try again after sometime.",
        //           error: _get(error, "message"),
        //         });
        //       });
        //   } catch (error) {
        //     console.log(error);
        //     console.log("error", "error in login with apple", error);
        //     return res.status(500).json({
        //       message: "Something happened wrong try again after sometime.",
        //       error: _get(error, "message"),
        //     });
        //   }
        // };
        //new code for apple login
        // protected loginWithApple = async (req: Request, res: Response) => {
        //   const payload = req.body;
        //   const auth_token = req.headers["apple-id-token"] as string;
        //   try {
        //     const firebaseUser = await getAuth().verifyIdToken(auth_token);
        //     // console.log(payload, "payload");
        //     let user = await getUserByFirebaseUserId(firebaseUser.uid);
        //     if (!user) {
        //       user = await getUserByEmail(firebaseUser.email);
        //     }
        //     // genearte random string
        //     if (!user) {
        //       user = await saveUser(
        //         new UserModel({
        //           email: firebaseUser.email,
        //           firebaseUserId: firebaseUser.uid,
        //           firstName: firebaseUser?.firstName || this.generateName(),
        //           lastName: this.generateName(),
        //           // deviceId: payload?.deviceId ?? "",
        //           deviceType: payload?.deviceType ?? "",
        //           isAppleLogin: true,
        //         })
        //       );
        //       const isExist = await checkFolderExistsWithUserId(user._id);
        //       if (!isExist) {
        //         await createFolder(user._id, { folderName: "All Notes" });
        //       }
        //       if (firebaseUser.picture) {
        //         const response = await axios.get(firebaseUser.picture, {
        //           responseType: "arraybuffer",
        //         });
        //         const profileImage = await uploadMediaToS3(
        //           "profileImage",
        //           response.data,
        //           "image/png",
        //           "image.png"
        //         );
        //         const image = new Image({
        //           userId: user._id.toString(),
        //           imageURL: profileImage.url,
        //           title: "ProfileImage",
        //         });
        //         const img = await saveImage(image);
        //         const updatedUsrClass = new User({
        //           _id: user._id.toString(),
        //           profileImage: img._id,
        //         });
        //         await updateUser(updatedUsrClass);
        //       }
        //       let notificationObj = {
        //         tokens: [payload.FCMToken],
        //         notification: {
        //           title: "🎉 Sign-up Successful! 🎉",
        //           body: "Welcome to AI Homework! 🤖 Start a fascinating chat with AI! Ask anything and see the magic unfold. Start exploring now! Start exploring now! You got 5 Credit free...",
        //         },
        //         data: {
        //           type: "google Sign-up notification",
        //         },
        //       };
        //       await sendNotification(notificationObj);
        //     } else {
        //       await updateUser(
        //         new User({
        //           _id: user._id.toString(),
        //           deviceId: "",
        //           deviceType: payload.deviceType ?? "",
        //           isAppleLogin: true,
        //         })
        //       );
        //     }
        //     if (payload.FCMToken) {
        //       await saveFCMToken(user._id.toString(), payload.FCMToken);
        //     }
        //     const token = jwt.sign(
        //       { id: user._id?.toString() },
        //       process.env.JWT_SECRET as Secret
        //     );
        //     const u = await getPopulatedUserById(user._id.toString());
        //     res.header("x-auth-token", token);
        //     res.status(StatusCodes.OK).json(u);
        //   } catch (error) {
        //     console.log("error in login with google", error);
        //     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        //       message: "Something happened wrong try again after sometime.",
        //     });
        //   }
        // };
        //latest flow
        this.loginWithApple = async (req, res) => {
            try {
                // console.log("payloadValue in login with apple", req.body);
                if (this.loginWithAppleSchema.validate(req.body).error) {
                    return res
                        .status(422)
                        .json(this.loginWithAppleSchema.validate(req.body).error);
                }
                let payloadValue = this.loginWithAppleSchema.validate(req.body).value;
                // Build Firebase credential with the Google ID token.
                let guestUser;
                if (payloadValue.userId) {
                    guestUser = await (0, user_1.getUserById)(payloadValue.userId);
                    await (0, user_1.updateUser)(new user_1.User(guestUser));
                }
                // if (payloadValue.deviceId || payloadValue.userId) {
                //   if (!guestUser) {
                //     return res.status(422).json({
                //       message: "Invalid deviceId",
                //     });
                //   }
                //   guestUser.FCMToken = [];
                //   guestUser.deviceId = payloadValue.deviceId;
                //   console.log("payloadValue.deviceId");
                //   await updateUser(new User(guestUser));
                // }
                // Sign in with credential from the Google user.
                (0, auth_1.getAuth)()
                    .verifyIdToken(req.headers["apple-id-token"])
                    .then(async (result) => {
                    let firebaseUser = result;
                    //check google token email with given email
                    if ((firebaseUser.email !== payloadValue.email,
                        firebaseUser.uid !== payloadValue.firebaseUserId)) {
                        return res.status(500).json({
                            message: "Something happened wrong try again after sometime.",
                        });
                    }
                    let user = await (0, user_1.getUserByFirebaseUserId)(firebaseUser.uid);
                    if (!user) {
                        user = await (0, user_1.getUserByEmail)(payloadValue.email);
                    }
                    let isRegistered = true;
                    if (!user) {
                        payloadValue.firstName = "SmartNoter";
                        payloadValue.lastName =
                            Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000;
                        payloadValue.username =
                            payloadValue.firstName +
                                payloadValue.lastName +
                                Math.floor(Math.random() * (99999 - 10000 + 1)) +
                                10000;
                        const userData = {
                            ...user_1.User.defaults,
                            ...payloadValue,
                            FCMToken: [payloadValue.pushToken],
                            isAppleLogin: true,
                            dailyCredits: guestUser && !guestUser.isTransferred
                                ? guestUser.dailyCredits
                                : 5,
                            // isEmailVerified: true,
                            deviceId: "",
                        };
                        if (payloadValue.profileImage) {
                            const response = await axios_1.default.get(payloadValue.profileImage, {
                                responseType: "arraybuffer",
                            });
                            let obj = {
                                buffer: response.data,
                            };
                            // const buffer = Buffer.from(response.data);
                            const url = await (0, image_1.createAndUploadImage)(obj, "guest-profileImage", "guest profileImage image", null);
                            userData.profileImage = url._id;
                        }
                        user = await (0, user_1.saveUser)(new user_1.User(userData));
                        user.isCreditEligible = !guestUser.isTransferred ? true : false;
                        user.isTransferred = true;
                        guestUser.isTransferred = true;
                        guestUser.isCreditEligible = false;
                        guestUser.dailyCredits = 0;
                        guestUser._id = guestUser._id.toString();
                        user._id = user._id.toString();
                        await (0, user_1.updateUser)(guestUser);
                        await (0, user_1.updateUser)(new user_1.User(user));
                        await (0, transferData_1.transferData)(guestUser, user);
                        const isExist = await (0, checkIfExistFolderWithUserId_1.checkFolderExistsWithUserId)(user._id);
                        if (!isExist) {
                            await (0, folders_1.createFolder)(user._id, { folderName: "All Notes" });
                        }
                        const isExistSummary = await (0, checkIfExistSummaryWithUserid_1.checkIfExistSummaryWithUserid)(guestUser._id);
                        if (!isExistSummary) {
                            await (0, createTextSummaryDefault_1.createTextSummaryByDefault)(user._id);
                        }
                        let notificationObj = {
                            tokens: [payloadValue.pushToken],
                            notification: {
                                title: "🎉 Sign-up Successful! 🎉",
                                body: "🎉 Welcome to SmartNoter! It's the perfect time to unleash your creativity and bring your ideas to life with Upscale creation. Start exploring now...",
                            },
                            data: {
                                type: "google Sign-up notification",
                            },
                        };
                        await (0, sendNotification_1.sendNotification)(notificationObj);
                        isRegistered = false;
                        const foundReward = await (0, getRewardsByUserId_1.getRewardByUserId)(user._id);
                        if (!foundReward) {
                            const rewardEntry = new schema_1.RewardModel({
                                type: "DAILY_LOGIN",
                                token: 0,
                                status: "APPROVED",
                                userId: user._id,
                                credit: 0,
                            });
                            await rewardEntry.save();
                        }
                    }
                    else {
                        if (!user.isAppleLogin) {
                            payloadValue = null;
                            user = null;
                            return res.status(422).json({
                                message: "This email address is already associated with another account. Please use a different email address.",
                            });
                        }
                    }
                    await (0, user_1.updateUser)(new user_1.User({ ...user, deviceId: "" }));
                    let populatedUser = await (0, user_1.getPopulatedUserById)(user._id);
                    let token = crypto_js_1.AES.encrypt(user._id.toString(), process.env.AES_KEY).toString();
                    payloadValue = null;
                    user = null;
                    return res
                        .cookie("auth", token, {
                        expires: new Date("12/31/2100"),
                        signed: true,
                    })
                        .status(200)
                        .set({ "x-auth-token": token })
                        .json({ ...populatedUser, isRegistered });
                })
                    .catch((error) => {
                    console.log("error", "error in login with apple", error);
                    return res.status(422).json({
                        message: "Something happened wrong try again after sometime.",
                        error: (0, lodash_1.get)(error, "message"),
                    });
                });
            }
            catch (error) {
                // console.log(error);
                console.log("error", "error in login with apple", error);
                return res.status(500).json({
                    message: "Something happened wrong try again after sometime.",
                    error: (0, lodash_1.get)(error, "message"),
                });
            }
        };
        this.logout = async (req, res) => {
            var _a, _b;
            try {
                const pushToken = req.body.pushToken;
                const user = req.authUser;
                if (user) {
                    const index = (_a = user.FCMToken) === null || _a === void 0 ? void 0 : _a.indexOf(pushToken);
                    if (index !== undefined && index !== -1) {
                        (_b = user.FCMToken) === null || _b === void 0 ? void 0 : _b.splice(index, 1);
                        await (0, user_1.updateUser)(new user_1.User(user));
                    }
                }
                return res.status(200).json({ message: "Logout" });
            }
            catch (error) {
                console.log("error", "error in logout ", error);
                return res.status(500).json({
                    message: "Something happened wrong try again after sometime.",
                    error: (0, lodash_1.get)(error, "message"),
                });
            }
        };
        this.guest = async (req, res) => {
            var _a;
            try {
                const payloadValue = await this.guestSchema
                    .validateAsync(req.body)
                    .then((value) => {
                    return value;
                })
                    .catch((e) => {
                    console.log(e);
                    if ((0, joi_1.isError)(e)) {
                        res.status(422).json(e);
                    }
                    else {
                        res.status(422).json({ message: e.message });
                    }
                });
                if (!payloadValue) {
                    return;
                }
                let user;
                if (payloadValue.userId && (0, mongoose_1.isValidObjectId)(payloadValue.userId)) {
                    user = await (0, user_1.getUserById)(payloadValue.userId);
                }
                if (!user) {
                    user = await (0, user_1.getUserByDeviceId)(payloadValue.deviceId);
                }
                if (!user) {
                    payloadValue.firstName = "SmartNoter";
                    payloadValue.lastName =
                        Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000;
                    // let flag = false;
                    // if (flag) {
                    // }
                    payloadValue.username =
                        payloadValue.firstName +
                            payloadValue.lastName +
                            Math.floor(Math.random() * (99999 - 10000 + 1)) +
                            10000;
                    const userData = {
                        ...payloadValue,
                        FCMToken: [payloadValue.pushToken],
                        isGuestLogin: true,
                        glitter: 3,
                    };
                    if (payloadValue.profileImage) {
                        const response = await axios_1.default.get(payloadValue.profileImage, {
                            responseType: "arraybuffer",
                        });
                        const obj = {
                            buffer: response.data,
                        };
                        const url = await (0, image_1.createAndUploadImage)(obj, "guest-profileImage", "guest profileImage image", null);
                        userData.profileImage = url._id;
                    }
                    user = await (0, user_1.saveUser)(new user_1.User(userData));
                    const isExist = await (0, checkIfExistFolderWithUserId_1.checkFolderExistsWithUserId)(user._id);
                    if (!isExist) {
                        await (0, folders_1.createFolder)(user._id, { folderName: "All Notes" });
                    }
                    const isExistSummary = await (0, checkIfExistSummaryWithUserid_1.checkIfExistSummaryWithUserid)(user._id);
                    console.log(isExistSummary);
                    if (!isExistSummary)
                        await (0, createTextSummaryDefault_1.createTextSummaryByDefault)(user._id);
                    let notificationObj = {
                        tokens: [payloadValue.pushToken],
                        notification: {
                            title: "🎉 Sign-up Successful! 🎉",
                            body: "Welcome to Smart Noter! It's the perfect time to unleash your creativity and bring your ideas to life with Art creation. Start exploring now! You got 5 Credit free...",
                        },
                        data: {
                            type: "google Sign-up notification",
                        },
                    };
                    await (0, sendNotification_1.sendNotification)(notificationObj);
                }
                else {
                    if (((_a = user.FCMToken) === null || _a === void 0 ? void 0 : _a.indexOf(payloadValue.pushToken)) === -1 &&
                        payloadValue.pushToken) {
                        let tokenArr = user.FCMToken;
                        tokenArr.push(req.body.pushToken);
                        const userData = {
                            ...user,
                            ...payloadValue,
                            FCMToken: tokenArr,
                        };
                        if (payloadValue.profileImage) {
                            const response = await axios_1.default.get(payloadValue.profileImage, {
                                responseType: "arraybuffer",
                            });
                            const obj = {
                                buffer: response.data,
                            };
                            const url = await (0, image_1.createAndUploadImage)(obj, "guest-profileImage", "guest profileImage image", null);
                            userData.profileImage = url._id;
                        }
                        await (0, user_1.updateUser)(new user_1.User(userData));
                    }
                }
                const isExist = await (0, checkIfExistFolderWithUserId_1.checkFolderExistsWithUserId)(user === null || user === void 0 ? void 0 : user._id);
                if (!isExist) {
                    await (0, folders_1.createFolder)(user._id, { folderName: "All Notes" });
                }
                const populateUser = await (0, user_1.getPopulatedUserById)(user._id);
                const token = crypto_js_1.AES.encrypt(user._id.toString(), process.env.AES_KEY).toString();
                user = null;
                return res
                    .cookie("auth", token, {
                    expires: new Date("12/31/2100"),
                    signed: true,
                })
                    .status(200)
                    .set({ "x-auth-token": token })
                    .json(populateUser);
            }
            catch (error) {
                console.log("error in guest ", error);
                return res.status(500).json({
                    message: "Something happened wrong try again after sometime.",
                    error: (0, lodash_1.get)(error, "message"),
                });
            }
        };
        this.session = async (req, res) => {
            var _a;
            try {
                let isAdmin = req.isAdmin;
                if (!isAdmin) {
                    return res.status(403).json({ message: "Unauthorized request." }).end();
                }
                let user = await (0, user_1.getPopulatedUserById)(((_a = req.authUser) === null || _a === void 0 ? void 0 : _a._id.toString()) || "");
                return res.status(200).json(user);
            }
            catch (error) {
                console.log("error at get session#################### ", error);
                return res.status(500).json({
                    message: "Something happened wrong try again after sometime.",
                    error: (0, lodash_1.get)(error, "message"),
                });
            }
        };
    }
}
exports.default = Controller;
//# sourceMappingURL=auth.controller.js.map