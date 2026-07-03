"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const rewards_1 = require("../../modules/rewards");
const generateReferralCode_1 = require("../../modules/rewards/generateReferralCode");
const saveReward_1 = require("../../modules/rewards/saveReward");
const getByReferCode_1 = require("../../modules/rewards/getByReferCode");
const http_status_codes_1 = require("http-status-codes");
const mongoose_1 = require("mongoose");
const updateReward_1 = require("../../modules/rewards/updateReward");
const getRewardsByUserId_1 = require("../../modules/rewards/getRewardsByUserId");
const user_1 = require("../../modules/user");
const lodash_1 = require("lodash");
const moment_1 = __importDefault(require("moment"));
const getRewardById_1 = require("../../modules/rewards/getRewardById");
class Controller {
    constructor() {
        //   private createReferralSchema = Joi.object().keys({
        //     type: Joi.string()
        //       .valid(
        //         "PLAY_STORE_REVIEW",
        //         "INSTAGRAM_POST",
        //         "REFERRAL",
        //         "REFER_EARN",
        //         "VIDEO_WATCH"
        //       )
        //       .optional(),
        //   });
        this.submitReferralSchema = joi_1.default.object().keys({
            referralCode: joi_1.default.string().required(),
            creditForReferUser: joi_1.default.number().required(),
            creditForUseCodeUser: joi_1.default.number().required(),
        });
        this.createReferral = async (req, res) => {
            const authUser = req.authUser;
            try {
                let refferalCode = await (0, generateReferralCode_1.generateReferralCode)();
                let existingReward = await (0, rewards_1.getExistingReward)(authUser._id, "REFER_EARN");
                if (existingReward) {
                    refferalCode = existingReward.referralCode;
                }
                else {
                    await (0, saveReward_1.saveReward)(new rewards_1.Reward({
                        userId: authUser._id,
                        referralCode: refferalCode,
                        type: "REFER_EARN",
                        status: "PENDING",
                    }));
                }
                return res.status(200).json({
                    message: "Referral code created successfully",
                    result: refferalCode,
                    success: true,
                });
            }
            catch (error) {
                if (error.isJoi) {
                    return res.status(422).json({ message: error.message });
                }
                console.log("error", "error in Referral", error);
                return res.status(500).json({
                    message: "Something happened wrong try again Refer after sometime",
                    error: JSON.stringify(error.message),
                });
            }
        };
        this.submitReferral = async (req, res) => {
            try {
                const authUser = req.authUser;
                const payloadValue = await this.submitReferralSchema.validateAsync(req.body, { stripUnknown: true });
                const { creditForReferUser, creditForUseCodeUser, referralCode } = payloadValue;
                const referralRewardExist = await (0, getByReferCode_1.getByReferCode)(referralCode, "REFER_EARN");
                if (!referralRewardExist) {
                    return res.status(404).json({
                        message: "Invalid referral code",
                        success: false,
                    });
                }
                if (referralRewardExist.userId.toString() === authUser._id.toString()) {
                    return res
                        .status(http_status_codes_1.StatusCodes.BAD_REQUEST)
                        .json({ message: "Cannot refer yourself", success: false });
                }
                if (referralRewardExist.refersUser
                    .map((oid) => oid.toString())
                    .includes(authUser._id.toString())) {
                    return res.status(400).json({
                        message: "User already referred",
                        success: false,
                    });
                }
                referralRewardExist.refersUser.push(new mongoose_1.Types.ObjectId(authUser._id));
                const updatedReward = await (0, updateReward_1.updateReward)(referralRewardExist._id, {
                    //@ts-ignore
                    $inc: { credit: creditForReferUser, count: 1 },
                    refersUser: referralRewardExist.refersUser,
                });
                await (0, saveReward_1.saveReward)(new rewards_1.Reward({
                    userId: authUser._id,
                    type: "REFERRAL",
                    credit: creditForUseCodeUser,
                    status: "APPROVED",
                }));
                await (0, user_1.updateUserByQry)({
                    query: { _id: referralRewardExist.userId },
                    update: {
                        $inc: {
                            dailyCredits: creditForReferUser,
                            rewardCount: creditForReferUser,
                        },
                    },
                });
                await (0, user_1.updateUserByQry)({
                    query: { _id: authUser._id },
                    update: {
                        $inc: {
                            dailyCredits: creditForUseCodeUser,
                            rewardCount: creditForUseCodeUser,
                        },
                    },
                });
                res.status(200).json({ message: "Referral submitted successfully" });
            }
            catch (error) {
                if (error.isJoi) {
                    return res.status(422).json({ message: error.message });
                }
                console.log("error", "error in Referral", error);
                return res.status(500).json({
                    message: "Something happened wrong try again submit Refer code after sometime",
                    error: JSON.stringify(error.message),
                });
            }
        };
        this.getReward = async (req, res) => {
            try {
                const authUser = req.authUser;
                if (!authUser) {
                    return res.status(403).json("unauthorized request");
                }
                const userReward = await (0, getRewardsByUserId_1.getRewardByUserId)(authUser._id);
                if (!userReward || userReward.length === 0) {
                    return res.status(404).json({
                        message: "No rewards found for this user",
                    });
                }
                return res.status(200).json({
                    result: userReward,
                    message: "Rewards for user",
                    success: true,
                });
            }
            catch (error) {
                return res.status(500).json({
                    success: false,
                    message: "Error get getReward",
                    error: error.message,
                });
            }
        };
        this.referralSchema = joi_1.default.object().keys({
            referralCode: joi_1.default.string().required(),
            creditForUseCodeUser: joi_1.default.number().required(),
            creditForReferUser: joi_1.default.number().required(),
        });
        this.submitInstagramPostSchema = joi_1.default.object().keys({
            postLink: joi_1.default.string().required(),
            credit: joi_1.default.number().required(),
        });
        this.playStoreReviewSchema = joi_1.default.object().keys({
            credit: joi_1.default.number().required(),
        });
        this.verifyInstagramPostSchema = joi_1.default.object().keys({
            status: joi_1.default.string().required().valid("APPROVED", "REJECTED"),
        });
        //glitter from body means token , which can be the glitter of user schema
        this.submitPlayStoreReview = async (req, res) => {
            try {
                const authUser = req.authUser;
                if (!authUser) {
                    return res.status(403).json("unauthorized request");
                }
                const payloadValue = await this.playStoreReviewSchema
                    .validateAsync(req.body)
                    .then((value) => {
                    return value;
                })
                    .catch((e) => {
                    throw { message: e.message, status: 422 };
                });
                const { credit } = payloadValue;
                let existingReward = await (0, rewards_1.getExistingReward)(authUser._id, "PLAY_STORE_REVIEW");
                if (existingReward) {
                    if (existingReward.credit >= 2) {
                        return res.status(409).json({
                            message: "User has already submitted a Play Store review",
                        });
                    }
                    else
                        await (0, updateReward_1.updateReward)(existingReward._id, {
                            //@ts-ignore
                            $inc: { credit: 1 },
                        });
                    return res.status(200).json({ message: "Reward added successfully" });
                }
                await (0, saveReward_1.saveReward)(new rewards_1.Reward({
                    userId: authUser._id,
                    credit: 1,
                    type: "PLAY_STORE_REVIEW",
                    token: credit,
                    status: "APPROVED",
                }));
                // let getUserTrackRequest = await findTrackRequest({
                //   query: { userId: authUser._id, type: process.env.DISEASE },
                // });
                // if (!getUserTrackRequest) {
                //   return res.status(404).json({ message: "Track request not found" });
                // }
                // getUserTrackRequest.glitter = getUserTrackRequest.glitter + req.body.glitter;
                // await updateTrackRequest(getUserTrackRequest);
                await (0, user_1.updateUserByQry)({ query: { _id: authUser._id }, update: {
                        $inc: {
                            rewardCount: credit,
                            dailyCredits: credit,
                        },
                    } });
                return res.status(200).json({ message: "Reward added successfully" });
            }
            catch (error) {
                console.log("error", "error in submitPlayStoreReview #################### ", error);
                return res.status(500).json({
                    message: "Something happened wrong try again after sometime.",
                    error: (0, lodash_1.get)(error, "message"),
                });
            }
        };
        // protected readonly submitVideoWatch = async (req: Request, res: Response) => {
        //   try {
        //     const authUser = req.authUser;
        //     if (!authUser) {
        //       return res.status(403).json("unauthorized request");
        //     }
        //     let existingReward = await getExistingReward({
        //       userId: authUser._id,
        //       type: "VIDEO_WATCH",
        //     });
        //     if (existingReward) {
        //       let updatedDate = moment(existingReward.updatedAt);
        //       if (updatedDate.isSame(new Date(), "day")) {
        //         if (existingReward?.glitter > 5) {
        //           await updateReward(authUser._id, {
        //             glitter: 0,
        //           });
        //           return res.status(400).json({
        //             message: "User has already watched 5 videos",
        //           });
        //         } else {
        //           await updateReward(authUser._id, {
        //             $inc: {
        //               token: req.body.message,
        //               glitter: 1,
        //             },
        //           });
        //         }
        //       } else {
        //         await saveReward(
        //           new Reward({
        //             userId: authUser._id,
        //             type: "VIDEO_WATCH",
        //             token: req.body.message,
        //             status: "APPROVED",
        //             glitter: 1,
        //           })
        //         );
        //       }
        //     } else {
        //       await saveReward(
        //         new Reward({
        //           userId: authUser._id,
        //           type: "VIDEO_WATCH",
        //           token: req.body.message,
        //           status: "APPROVED",
        //           glitter: 1,
        //         })
        //       );
        //     }
        //     await updateUserForReward(authUser._id, {
        //       $inc: { token: req.body.message,
        //     });
        //     return res.status(200).json({ message: "Reward added successfully" });
        //   } catch (error) {
        //     console.log(
        //       "error",
        //       "error in submitVideoWatch #################### ",
        //       error
        //     );
        //     return res.status(500).json({
        //       message: "Something happened wrong try again after sometime.",
        //       error: _get(error, "message"),
        //     });
        //   }
        // };
        this.submitVideoWatch = async (req, res) => {
            try {
                const authUser = req.authUser;
                if (!authUser) {
                    return res.status(403).json({ message: "Unauthorized request" });
                }
                const payloadValue = await this.playStoreReviewSchema
                    .validateAsync(req.body)
                    .then((value) => {
                    return value;
                })
                    .catch((e) => {
                    throw { message: e.message, status: 422 };
                });
                const { credit } = payloadValue;
                const existingReward = await (0, rewards_1.getExistingReward)(authUser._id, "VIDEO_WATCH");
                if (existingReward) {
                    const updatedDate = (0, moment_1.default)(existingReward.updatedAt);
                    const today = (0, moment_1.default)();
                    // console.log(updatedDate.isSame(today, "day"), ":::::::::::::::");
                    if (updatedDate.isSame(today, "day") && existingReward.credit >= 5) {
                        //429 Too Many Requests
                        return res
                            .status(429)
                            .json({ message: "You already watched 5 videos today" });
                    }
                    let status = existingReward.credit + 1 >= 5 ? "APPROVED" : "PENDING";
                    if (updatedDate.isSame(today, "day")) {
                        await (0, updateReward_1.updateReward)(existingReward._id, {
                            //@ts-ignore
                            $inc: {
                                credit: credit,
                                count: 1,
                            },
                            status,
                        });
                    }
                    else {
                        await (0, updateReward_1.updateReward)(existingReward._id, {
                            //@ts-ignore
                            $inc: {
                                credit: credit,
                                count: 1,
                            },
                            status: "PENDING",
                        });
                    }
                }
                else {
                    // If no existing reward, create a new one
                    await (0, saveReward_1.saveReward)(new rewards_1.Reward({
                        userId: authUser._id,
                        type: "VIDEO_WATCH",
                        count: 1,
                        status: "PENDING",
                        credit,
                    }));
                }
                // let getUserTrackRequest = await findTrackRequest({
                //   query: { userId: authUser._id, type: process.env.DISEASE },
                // });
                // if (!getUserTrackRequest) {
                //   return res.status(404).json({ message: "Track request not found" });
                // }
                // getUserTrackRequest.glitter = getUserTrackRequest.glitter + req.body.glitter;
                // await updateTrackRequest(getUserTrackRequest);
                await (0, user_1.updateUserByQry)({ query: { _id: authUser._id }, update: {
                        $inc: {
                            rewardCount: credit,
                            dailyCredits: credit,
                        },
                    } });
                return res.status(200).json({ message: "Reward added successfully" });
            }
            catch (error) {
                console.error("Error in submitVideoWatch: ", error);
                return res.status(500).json({
                    message: "Something happened wrong, try again after sometime.",
                    error: error.message,
                });
            }
        };
        this.submitInstagramPost = async (req, res) => {
            try {
                const authUser = req.authUser;
                if (!authUser) {
                    return res.status(403).json("unauthorized request");
                }
                const payloadValue = await this.submitInstagramPostSchema
                    .validateAsync(req.body)
                    .then((value) => {
                    return value;
                })
                    .catch((e) => {
                    console.log("error", e);
                    throw { message: e.message, status: 422 };
                });
                // console.log("????????????");
                const { postLink, credit } = payloadValue;
                let existingReward = await (0, rewards_1.getExistingReward)(authUser._id, "INSTAGRAM_POST");
                if (existingReward) {
                    if (existingReward.status === "APPROVED") {
                        return res.status(429).json({
                            message: "You already submitted an Instagram post",
                        });
                    }
                    else {
                        await (0, updateReward_1.updateReward)(existingReward._id, {
                            //@ts-ignore
                            $inc: {
                                credit: credit,
                                count: 1,
                            },
                            status: "PENDING",
                            postLink
                        });
                        return res
                            .status(200)
                            .json({ message: "Instagram post updated successfully" });
                    }
                }
                else {
                    await (0, saveReward_1.saveReward)(new rewards_1.Reward({
                        userId: authUser._id,
                        type: "INSTAGRAM_POST",
                        postLink,
                        status: "PENDING",
                        credit,
                    }));
                    return res
                        .status(200)
                        .json({ message: "Instagram post submitted successfully" });
                }
                // if (existingReward) {
                //   const lastPostDate = new Date(existingReward.createdAt); // Ensure createdAt is a Date object
                //   const today = new Date();
                //   const diffTime = Math.abs(today.getTime() - lastPostDate.getTime());
                //   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                //   if (diffDays < 3) {
                //     return res.status(400).json({
                //       message: "You can only submit a new Instagram post every 3 days.",
                //     });
                //   } else {
                //     await saveReward(
                //       new Reward({
                //         userId: authUser._id,
                //         type: "INSTAGRAM_POST",
                //         postLink,
                //         status: "PENDING",
                //       })
                //     );
                //   }
                // }
            }
            catch (error) {
                return res.status(error.status || 500).json({
                    message: "Error submitting Instagram post",
                    error: error.message,
                });
            }
        };
        this.getInstagramPost = async (req, res) => {
            try {
                const authUser = req.authUser;
                if (!authUser) {
                    return res.status(403).json("unauthorized request");
                }
                let instagramReward = await (0, rewards_1.getExistingReward)(authUser._id, "INSTAGRAM_POST", "PENDING");
                return res.status(200).json(instagramReward);
            }
            catch (error) {
                return res.status(500).json({
                    success: false,
                    message: "Error get Instagram post",
                    error: error.message,
                });
            }
        };
        this.verifyInstagramPost = async (req, res) => {
            try {
                const { rewardId } = req.params;
                const reward = await (0, getRewardById_1.getRewardById)(rewardId);
                // console.log("reward", reward);
                if (!reward) {
                    return res.status(404).json({
                        success: false,
                        message: "Reward not found",
                    });
                }
                const payloadValue = await this.verifyInstagramPostSchema
                    .validateAsync(req.body)
                    .then((value) => {
                    return value;
                })
                    .catch((e) => {
                    throw { message: e.message, status: 422 };
                });
                const { status } = payloadValue;
                // if (reward.status !== "PENDING") {
                //   return res.status(400).json({
                //     success: false,
                //     message: "Reward is no longer pending",
                //   });
                // }
                if (reward.status === "APPROVED") {
                    return res.status(400).json({
                        success: false,
                        message: "Reward is already approved",
                    });
                }
                if (reward.status === "REJECTED") {
                    return res.status(400).json({
                        success: false,
                        message: "Reward is already rejected",
                    });
                }
                reward.status = status;
                if (status === "APPROVED") {
                    reward.count = reward.count + 1;
                    reward.credit = reward.credit + 1;
                }
                await (0, updateReward_1.updateReward)(rewardId, reward);
                if (status === "APPROVED") {
                    // let getUserTrackRequest = await findTrackRequest({
                    //   query: { userId: reward.userId, type: process.env.DISEASE },
                    // });
                    // if (!getUserTrackRequest) {
                    //   return res.status(404).json({ message: "Track request not found" });
                    // }
                    // getUserTrackRequest.glitter = getUserTrackRequest.glitter + reward.token;
                    // await updateTrackRequest(getUserTrackRequest);
                    await (0, user_1.updateUserByQry)({ query: reward.userId, update: {
                            $inc: {
                                rewardCount: reward.count,
                                dailyCredits: reward.count,
                            },
                        } });
                    // await updateUserForReward(reward.userId, {
                    //   $inc: {
                    //     token: reward.token,
                    //     rewardCount: reward.token,
                    //   },
                    // });
                }
                return res.status(200).json({
                    success: true,
                    data: reward,
                });
            }
            catch (error) {
                return res.status(error.status || 500).json({
                    success: false,
                    message: "Error verifying Instagram post",
                    error: error.message,
                });
            }
        };
    }
}
exports.default = Controller;
//# sourceMappingURL=rewards.controller.js.map