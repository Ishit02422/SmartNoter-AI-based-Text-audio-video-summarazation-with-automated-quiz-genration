import Joi from "joi";
import { Request } from "../../request";
import { Response } from "express";
import { getExistingReward, Reward, RewardModel } from "../../modules/rewards";
import { generateReferralCode } from "../../modules/rewards/generateReferralCode";
import { saveReward } from "../../modules/rewards/saveReward";
import { getByReferCode } from "../../modules/rewards/getByReferCode";
import { StatusCodes } from "http-status-codes";
import {  Types } from "mongoose";
import { updateReward } from "../../modules/rewards/updateReward";
import { getRewardByUserId } from "../../modules/rewards/getRewardsByUserId";
import {
  updateUserByQry,
} from "../../modules/user";
import {get as _get} from "lodash"
import moment from "moment";
import { getRewardById } from "../../modules/rewards/getRewardById";

export default class Controller {
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
  private submitReferralSchema = Joi.object().keys({
    referralCode: Joi.string().required(),
    creditForReferUser: Joi.number().required(),
    creditForUseCodeUser: Joi.number().required(),
  });
  protected readonly createReferral = async (req: Request, res: Response) => {
    const authUser = req.authUser;
    try {
      let refferalCode = await generateReferralCode();
      let existingReward = await getExistingReward(authUser._id, "REFER_EARN");
      if (existingReward) {
        refferalCode = existingReward.referralCode;
      } else {
        await saveReward(
          new Reward({
            userId: authUser._id as Types.ObjectId,
            referralCode: refferalCode,
            type: "REFER_EARN",
            status: "PENDING",
          })
        );
      }
      return res.status(200).json({
        message: "Referral code created successfully",
        result: refferalCode,
        success: true,
      });
    } catch (error) {
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

  protected readonly submitReferral = async (req: Request, res: Response) => {
    try {
      const authUser = req.authUser;
      const payloadValue = await this.submitReferralSchema.validateAsync(
        req.body,
        { stripUnknown: true }
      );
      const { creditForReferUser, creditForUseCodeUser, referralCode } =
        payloadValue;

      const referralRewardExist:any = await getByReferCode(
        referralCode,
        "REFER_EARN"
      );
      if (!referralRewardExist) {
        return res.status(404).json({
          message: "Invalid referral code",
          success: false,
        });
      }

      if (referralRewardExist.userId.toString() === authUser._id.toString()) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Cannot refer yourself", success: false });
      }
      if (
        referralRewardExist.refersUser
          .map((oid: any) => oid.toString())
          .includes(authUser._id.toString())
      ) {
        return res.status(400).json({
          message: "User already referred",
          success: false,
        });
      }
      referralRewardExist.refersUser.push(new Types.ObjectId(authUser._id) );

      const updatedReward = await updateReward(referralRewardExist._id, {
        //@ts-ignore
        $inc: { credit: creditForReferUser, count: 1 },
        refersUser: referralRewardExist.refersUser,
      });
      await saveReward(
        new Reward({
          userId: authUser._id as Types.ObjectId,
          type: "REFERRAL",
          credit: creditForUseCodeUser,
          status: "APPROVED",
        })
      );

      await updateUserByQry({
        query: { _id: referralRewardExist.userId },
        update: {
          $inc: {
            dailyCredits: creditForReferUser,
            rewardCount: creditForReferUser,
          },
        },
      });
      await updateUserByQry({
        query: { _id: authUser._id },
        update: {
          dailyCredits: creditForUseCodeUser,
          rewardCount: creditForUseCodeUser,
        },
      });

      res.status(200).json({ message: "Referral submitted successfully" });
    } catch (error) {
      if (error.isJoi) {
        return res.status(422).json({ message: error.message });
      }
      console.log("error", "error in Referral", error);
      return res.status(500).json({
        message:
          "Something happened wrong try again submit Refer code after sometime",
        error: JSON.stringify(error.message),
      });
    }
  };
  protected readonly getReward = async (req: Request, res: Response) => {
    try {
      const authUser = req.authUser;
      if (!authUser) {
        return res.status(403).json("unauthorized request");
      }
      const userReward = await getRewardByUserId(authUser._id);
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
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error get getReward",
        error: error.message,
      });
    }
  };

   private readonly referralSchema = Joi.object().keys({
    referralCode: Joi.string().required(),
    creditForUseCodeUser: Joi.number().required(),
    creditForReferUser: Joi.number().required(),
  });

  private readonly submitInstagramPostSchema = Joi.object().keys({
    postLink: Joi.string().required(),
    credit: Joi.number().required(),
  });

  private readonly playStoreReviewSchema = Joi.object().keys({
    credit: Joi.number().required(),
  });

  private readonly verifyInstagramPostSchema = Joi.object().keys({
    status: Joi.string().required().valid("APPROVED", "REJECTED"),
  });

  //glitter from body means token , which can be the glitter of user schema

  protected readonly submitPlayStoreReview = async (
    req: Request,
    res: Response
  ) => {
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
      
      let existingReward = await getExistingReward(authUser._id, "PLAY_STORE_REVIEW");

      if (existingReward) {
        if (existingReward.credit >= 2) {
          return res.status(409).json({
            message: "User has already submitted a Play Store review",
          });
        } else
          await updateReward(existingReward._id, {
            //@ts-ignore
            $inc: { credit: 1 },
          });
        return res.status(200).json({ message: "Reward added successfully" });
      }
      await saveReward(
        new Reward({
          userId: authUser._id as Types.ObjectId,
          credit: 1,
          type: "PLAY_STORE_REVIEW",
          token: credit,
          status: "APPROVED",
        })
      );

      // let getUserTrackRequest = await findTrackRequest({
      //   query: { userId: authUser._id, type: process.env.DISEASE },
      // });

      // if (!getUserTrackRequest) {
      //   return res.status(404).json({ message: "Track request not found" });
      // }

      // getUserTrackRequest.glitter = getUserTrackRequest.glitter + req.body.glitter;

      // await updateTrackRequest(getUserTrackRequest);

      await updateUserByQry({query: { _id: authUser._id }, update: {
        $inc: {
          rewardCount: credit,
          dailyCredits: credit,
        },
      }});

      return res.status(200).json({ message: "Reward added successfully" });
    } catch (error) {
      console.log(
        "error",
        "error in submitPlayStoreReview #################### ",
        error
      );
      return res.status(500).json({
        message: "Something happened wrong try again after sometime.",
        error: _get(error, "message"),
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

  protected readonly submitVideoWatch = async (req: Request, res: Response) => {
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
      const existingReward = await getExistingReward(
        authUser._id,
         "VIDEO_WATCH",
      );

      if (existingReward) {
        const updatedDate = moment(existingReward.updatedAt);
        const today = moment();
        // console.log(updatedDate.isSame(today, "day"), ":::::::::::::::");

        if (updatedDate.isSame(today, "day") && existingReward.credit >= 5) {
          //429 Too Many Requests
          return res
            .status(429)
            .json({ message: "You already watched 5 videos today" });
        }
        let status = existingReward.credit + 1 >= 5 ? "APPROVED" : "PENDING";
        if (updatedDate.isSame(today, "day")) {
          await updateReward(existingReward._id, {
            //@ts-ignore
            $inc: {
              credit: credit,
              count: 1,
            },
            status,
          });
        } else {
          await updateReward(existingReward._id, {
            //@ts-ignore
            $inc: {
              credit: credit,
              count: 1,
            },
            status: "PENDING",
          });
        }
      } else {
        // If no existing reward, create a new one
        await saveReward(
          new Reward({
            userId: authUser._id as Types.ObjectId,
            type: "VIDEO_WATCH",
            count: 1,
            status: "PENDING",
            credit,
          })
        );
      }

      // let getUserTrackRequest = await findTrackRequest({
      //   query: { userId: authUser._id, type: process.env.DISEASE },
      // });

      // if (!getUserTrackRequest) {
      //   return res.status(404).json({ message: "Track request not found" });
      // }

      // getUserTrackRequest.glitter = getUserTrackRequest.glitter + req.body.glitter;

      // await updateTrackRequest(getUserTrackRequest);

      await updateUserByQry({query: {_id: authUser._id},update: {
        $inc: {
          rewardCount: credit,
          dailyCredits: credit,
        },
      }})
      return res.status(200).json({ message: "Reward added successfully" });
    } catch (error) {
      console.error("Error in submitVideoWatch: ", error);
      return res.status(500).json({
        message: "Something happened wrong, try again after sometime.",
        error: error.message,
      });
    }
  };

protected readonly submitInstagramPost = async (
    req: Request,
    res: Response
  ) => {
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
      let existingReward = await getExistingReward(
        authUser._id,
        "INSTAGRAM_POST"
      );
      if (existingReward) {
        if (existingReward.status === "APPROVED") {
          return res.status(429).json({
            message: "You already submitted an Instagram post",
          });
        } else {
      
          await updateReward(existingReward._id, {
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
      } else {
        await saveReward(
          new Reward({
            userId: authUser._id as Types.ObjectId,
            type: "INSTAGRAM_POST",
            postLink,
            status: "PENDING",
            credit,
          })
        );
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
    } catch (error) {
      return res.status(error.status || 500).json({
        message: "Error submitting Instagram post",
        error: error.message,
      });
    }
  };

  protected readonly getInstagramPost = async (req: Request, res: Response) => {
    try {
       const authUser = req.authUser;
      if (!authUser) {
        return res.status(403).json("unauthorized request");
      }
      let instagramReward = await getExistingReward(
        authUser._id as Types.ObjectId,  
        "INSTAGRAM_POST",
        "PENDING",
      );
      return res.status(200).json(instagramReward);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error get Instagram post",
        error: error.message,
      });
    }
  };

  protected readonly verifyInstagramPost = async (
    req: Request,
    res: Response
  ) => {
    try {
      const { rewardId } = req.params;
      const reward = await getRewardById(rewardId);
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
      await updateReward(rewardId, reward);

      if (status === "APPROVED") {
        // let getUserTrackRequest = await findTrackRequest({
        //   query: { userId: reward.userId, type: process.env.DISEASE },
        // });

        // if (!getUserTrackRequest) {
        //   return res.status(404).json({ message: "Track request not found" });
        // }

        // getUserTrackRequest.glitter = getUserTrackRequest.glitter + reward.token;

        // await updateTrackRequest(getUserTrackRequest);

        await updateUserByQry({query: reward.userId,update: {
          $inc: {
            rewardCount: reward.count,
            dailyCredits: reward.count,
          },
        }});
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
    } catch (error) {
      return res.status(error.status || 500).json({
        success: false,
        message: "Error verifying Instagram post",
        error: error.message,
      });
    }
  };
}
