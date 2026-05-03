import { Response } from "express";
import { getAuth } from "firebase-admin/auth";
import { Request } from "../../request";
import jwt, { Secret, JwtPayload } from "jsonwebtoken";
import Joi, { isError } from "joi";
import { get as _get } from "lodash";
import { sendNotification } from "../../helper/sendNotification";
import {
  IUser,
  User,
  getPopulatedUserById,
  getUserByDeviceId,
  getUserByEmail,
  getUserByFirebaseUserId,
  getUserById,
  saveFCMToken,
  saveUser,
  updateUser,
} from "../../modules/user";
import { checkFolderExistsWithUserId } from "../../modules/folders/checkIfExistFolderWithUserId";
import { createFolder } from "../../modules/folders";
import { UserModel } from "../../modules/user/schema";
import axios from "axios";
import { uploadMediaToS3 } from "../../modules/image/saveMediaToS3";
import { createAndUploadImage, Image, saveImage } from "../../modules/image";
import { StatusCodes } from "http-status-codes";
import { transferData } from "../../modules/user/transferData";
import { getRewardByUserId } from "../../modules/rewards/getRewardsByUserId";
import { RewardModel } from "../../modules/rewards/schema";
import { AES } from "crypto-js";
import { createTextSummaryByDefault } from "../../modules/generateSummaryFromText/createTextSummaryDefault";
import { isValidObjectId } from "mongoose";
import { checkTextSummaryIsExistById } from "../../modules/generateSummaryFromText";
import { checkIfExistSummaryWithUserid } from "../../modules/generateSummaryFromText/checkIfExistSummaryWithUserid";

export default class Controller {
  private readonly loginWithGoogleSchema = Joi.object({
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    username: Joi.string().optional(),
    email: Joi.string().email().required(),
    firebaseUserId: Joi.string().required(),
    pushToken: Joi.string().required(),
    deviceId: Joi.string().optional(),
    deviceType: Joi.string().optional(),
    profileImage: Joi.string().optional(),
    userId: Joi.string().optional().allow(""),
  });

  private readonly loginWithAppleSchema = Joi.object({
    firstName: Joi.string().optional().allow(""),
    lastName: Joi.string().optional().allow(""),
    username: Joi.string().optional(),
    email: Joi.string().email().optional().allow(""),
    firebaseUserId: Joi.string().required(),
    // phoneNumber: Joi.string().required(),
    pushToken: Joi.string().required(),
    profileImage: Joi.string().optional(),
    deviceId: Joi.string().optional(),
    deviceType: Joi.string().optional(),
    userId: Joi.string().optional().allow(""),
  });

  private readonly duplicateSchema = Joi.object({
    email: Joi.string()
      .email()
      .required()
      .external(async (v: string) => {
        const user: IUser = (await getUserByEmail(v)) as IUser;
        if (user) {
          throw new Error(
            "This email address is already associated with another account. Please use a different email address."
          );
        }
        return v;
      }),
  });

  private readonly guestSchema = Joi.object({
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    username: Joi.string().optional(),
    deviceId: Joi.string().required(),
    pushToken: Joi.string().required(),
    deviceType: Joi.string().required(),
    profileImage: Joi.string().optional(),
    firebaseUserId: Joi.string().optional(),
    userId: Joi.string().optional().allow(""),
  });

  private readonly generateName = async () => {
    const { customAlphabet } = await import("nanoid");
    const random_name = customAlphabet(
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
      11
    );
    return random_name;
  };

  protected readonly duplicate = async (req: Request, res: Response) => {
    try {
      const payloadValue = await this.duplicateSchema
        .validateAsync(req.body)
        .then((value) => {
          return value;
        })
        .catch((e) => {
          console.log(e);
          if (isError(e)) {
            res.status(422).json(e);
          } else {
            res.status(422).json({ message: e.message });
          }
        });
      if (!payloadValue) {
        return;
      }
      return res.status(200).json({ message: "Success" });
    } catch (error) {
      console.log("error in login", error);
      return res.status(500).json({
        message: "Something happened wrong try again after sometime.",
        error: _get(error, "message"),
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

  protected readonly loginWithGoogle = async (req: Request, res: Response) => {
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

      let guestUser: User = null;
      if (payloadValue.userId) {
        guestUser = await getUserById(payloadValue.userId);
        guestUser.deviceId = payloadValue.deviceId;
        await updateUser(new User(guestUser));
      }

      getAuth()
        .verifyIdToken(req.headers["google-id-token"] as string)
        .then(async (result) => {
          const firebaseUser = result;

          //check google token email with given email
          if (
            (firebaseUser.email !== payloadValue.email,
              firebaseUser.uid !== payloadValue.firebaseUserId)
          ) {
            return res.status(500).json({
              message: "Something happened wrong try again after sometime.",
            });
          }

          let user: IUser = await getUserByFirebaseUserId(firebaseUser.uid);

          if (!user) {
            user = await getUserByEmail(payloadValue.email);
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
              ...User.defaults,
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
                const response = await axios.get(payloadValue.profileImage, {
                  responseType: "arraybuffer",
                });

                let obj = {
                  buffer: response.data,
                };

                const url = await createAndUploadImage(
                  obj,
                  "guest-profileImage",
                  "guest profileImage image",
                  null
                );
                userData.profileImage = url._id;
              } catch (imgErr) {
                console.log("Could not upload profile image, skipping.", imgErr);
              }
            }

            user = await saveUser(new User(userData));

            user.isCreditEligible = guestUser && !guestUser.isTransferred ? true : false;
            user.isTransferred = true;
            user._id = user._id.toString();

            if (guestUser) {
              guestUser.isTransferred = true;
              guestUser.isCreditEligible = false;
              guestUser.dailyCredits = 0;
              guestUser._id = guestUser._id.toString();
              await updateUser(guestUser);
              await transferData(guestUser, user);
            }

            await updateUser(new User(user));
            const isExist = await checkFolderExistsWithUserId(user._id);
            if (!isExist) {
              await createFolder(user._id, { folderName: "All Notes" });
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
            await sendNotification(notificationObj);
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
          } else {
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
                const response = await axios.get(payloadValue.profileImage, {
                  responseType: "arraybuffer",
                });

                let obj = {
                  buffer: response.data,
                };
                const url = await createAndUploadImage(
                  obj,
                  "guest-profileImage",
                  "guest profileImage image",
                  null
                );
                userData.profileImage = url._id;
              }

              await updateUser(new User(userData));
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

            if (
              user.FCMToken.indexOf(payloadValue.pushToken) === -1 &&
              payloadValue.pushToken
            ) {
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
                const response = await axios.get(payloadValue.profileImage, {
                  responseType: "arraybuffer",
                });

                let obj = {
                  buffer: response.data,
                };

                // const buffer = Buffer.from(response.data);
                const url = await createAndUploadImage(
                  obj,
                  "guest-profileImage",
                  "guest profileImage image",
                  null
                );
                userData.profileImage = url._id;
              }
              const foundReward = await getRewardByUserId(user._id);
              if (!foundReward) {
                const rewardEntry = new RewardModel({
                  type: "DAILY_LOGIN",
                  token: 0,
                  status: "APPROVED",
                  userId: user._id,
                  credit: 0,
                });
                await rewardEntry.save();
              }

              await updateUser(new User(userData as IUser));
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
          const populatedUser = await getPopulatedUserById(user._id);
          const token = AES.encrypt(
            user._id.toString(),
            process.env.AES_KEY
          ).toString();
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
            error: _get(error, "message"),
          });
        });
    } catch (error) {
      console.log(error);
      console.log("error", "error in login with google", error);
      return res.status(500).json({
        message: "Something happened wrong try again after sometime.",
        error: _get(error, "message"),
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
  protected readonly loginWithApple = async (req: Request, res: Response) => {
    try {
      // console.log("payloadValue in login with apple", req.body);
      if (this.loginWithAppleSchema.validate(req.body).error) {
        return res
          .status(422)
          .json(this.loginWithAppleSchema.validate(req.body).error);
      }
      let payloadValue = this.loginWithAppleSchema.validate(req.body).value;
      // Build Firebase credential with the Google ID token.

      let guestUser: User;
      if (payloadValue.userId) {
        guestUser = await getUserById(payloadValue.userId);
        await updateUser(new User(guestUser));
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
      getAuth()
        .verifyIdToken(req.headers["apple-id-token"] as string)
        .then(async (result) => {
          let firebaseUser = result;

          //check google token email with given email
          if (
            (firebaseUser.email !== payloadValue.email,
              firebaseUser.uid !== payloadValue.firebaseUserId)
          ) {
            return res.status(500).json({
              message: "Something happened wrong try again after sometime.",
            });
          }

          let user: IUser = await getUserByFirebaseUserId(firebaseUser.uid);

          if (!user) {
            user = await getUserByEmail(payloadValue.email);
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
              ...User.defaults,
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
              const response = await axios.get(payloadValue.profileImage, {
                responseType: "arraybuffer",
              });

              let obj = {
                buffer: response.data,
              };

              // const buffer = Buffer.from(response.data);
              const url = await createAndUploadImage(
                obj,
                "guest-profileImage",
                "guest profileImage image",
                null
              );
              userData.profileImage = url._id;
            }
            user = await saveUser(new User(userData));
            user.isCreditEligible = !guestUser.isTransferred ? true : false;
            user.isTransferred = true;

            guestUser.isTransferred = true;
            guestUser.isCreditEligible = false;
            guestUser.dailyCredits = 0;

            guestUser._id = guestUser._id.toString();
            user._id = user._id.toString();

            await updateUser(guestUser);
            await updateUser(new User(user));

            await transferData(guestUser, user);
            const isExist = await checkFolderExistsWithUserId(user._id);
            if (!isExist) {
              await createFolder(user._id, { folderName: "All Notes" });
            }
            const isExistSummary = await checkIfExistSummaryWithUserid(
              guestUser._id
            );

            if (!isExistSummary) {
              await createTextSummaryByDefault(user._id);
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
            await sendNotification(notificationObj);
            isRegistered = false;
            const foundReward = await getRewardByUserId(user._id);
            if (!foundReward) {
              const rewardEntry = new RewardModel({
                type: "DAILY_LOGIN",
                token: 0,
                status: "APPROVED",
                userId: user._id,
                credit: 0,
              });
              await rewardEntry.save();
            }
          } else {
            if (!user.isAppleLogin) {
              payloadValue = null;
              user = null;
              return res.status(422).json({
                message:
                  "This email address is already associated with another account. Please use a different email address.",
              });
            }
          }
          await updateUser(new User({ ...user, deviceId: "" }));

          let populatedUser = await getPopulatedUserById(user._id);
          let token = AES.encrypt(
            user._id.toString(),
            process.env.AES_KEY
          ).toString();
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
            error: _get(error, "message"),
          });
        });
    } catch (error) {
      // console.log(error);
      console.log("error", "error in login with apple", error);
      return res.status(500).json({
        message: "Something happened wrong try again after sometime.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly logout = async (req: Request, res: Response) => {
    try {
      const pushToken = req.body.pushToken;
      const user = req.authUser;
      if (user) {
        const index = user.FCMToken?.indexOf(pushToken);
        if (index !== undefined && index !== -1) {
          user.FCMToken?.splice(index, 1);
          await updateUser(new User(user));
        }
      }
      return res.status(200).json({ message: "Logout" });
    } catch (error) {
      console.log("error", "error in logout ", error);
      return res.status(500).json({
        message: "Something happened wrong try again after sometime.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly guest = async (req: Request, res: Response) => {
    try {
      const payloadValue = await this.guestSchema
        .validateAsync(req.body)
        .then((value) => {
          return value;
        })
        .catch((e) => {
          console.log(e);
          if (isError(e)) {
            res.status(422).json(e);
          } else {
            res.status(422).json({ message: e.message });
          }
        });
      if (!payloadValue) {
        return;
      }
      let user: IUser;
      if (payloadValue.userId && isValidObjectId(payloadValue.userId)) {
        user = await getUserById(payloadValue.userId);
      }
      if (!user) {
        user = await getUserByDeviceId(payloadValue.deviceId);
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
          const response = await axios.get(payloadValue.profileImage, {
            responseType: "arraybuffer",
          });

          const obj = {
            buffer: response.data,
          };

          const url = await createAndUploadImage(
            obj,
            "guest-profileImage",
            "guest profileImage image",
            null
          );

          userData.profileImage = url._id;
        }
        user = await saveUser(new User(userData));
        const isExist = await checkFolderExistsWithUserId(user._id);
        if (!isExist) {
          await createFolder(user._id, { folderName: "All Notes" });
        }
        const isExistSummary = await checkIfExistSummaryWithUserid(user._id);
        console.log(isExistSummary);
        if (!isExistSummary) await createTextSummaryByDefault(user._id);
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
        await sendNotification(notificationObj);
      } else {
        if (
          user.FCMToken?.indexOf(payloadValue.pushToken) === -1 &&
          payloadValue.pushToken
        ) {
          let tokenArr = user.FCMToken;
          tokenArr.push(req.body.pushToken);
          const userData = {
            ...user,
            ...payloadValue,
            FCMToken: tokenArr,
          };

          if (payloadValue.profileImage) {
            const response = await axios.get(payloadValue.profileImage, {
              responseType: "arraybuffer",
            });

            const obj = {
              buffer: response.data,
            };

            const url = await createAndUploadImage(
              obj,
              "guest-profileImage",
              "guest profileImage image",
              null
            );

            userData.profileImage = url._id;
          }
          await updateUser(new User(userData as IUser));
        }
      }
      const isExist = await checkFolderExistsWithUserId(user?._id);
      if (!isExist) {
        await createFolder(user._id, { folderName: "All Notes" });
      }
      const populateUser = await getPopulatedUserById(user._id);

      const token = AES.encrypt(
        user._id.toString(),
        process.env.AES_KEY
      ).toString();
      user = null;
      return res
        .cookie("auth", token, {
          expires: new Date("12/31/2100"),
          signed: true,
        })
        .status(200)
        .set({ "x-auth-token": token })
        .json(populateUser);
    } catch (error) {
      console.log("error in guest ", error);
      return res.status(500).json({
        message: "Something happened wrong try again after sometime.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly session = async (req: Request, res: Response) => {
    try {
      let isAdmin = req.isAdmin;

      if (!isAdmin) {
        return res.status(403).json({ message: "Unauthorized request." }).end();
      }
      let user = await getPopulatedUserById(req.authUser?._id.toString() || "");
      return res.status(200).json(user);
    } catch (error) {
      console.log("error at get session#################### ", error);

      return res.status(500).json({
        message: "Something happened wrong try again after sometime.",
        error: _get(error, "message"),
      });
    }
  };
}
