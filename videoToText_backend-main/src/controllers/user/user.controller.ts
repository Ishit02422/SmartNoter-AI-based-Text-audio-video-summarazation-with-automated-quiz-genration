import { Response } from "express";
import { Request } from "../../request";
import Joi, { isError } from "joi";
import { getImageById } from "../../modules/image";
import {
  getPopulatedUserById,
  getUserByEmail,
  updateUser,
  getUserById,
  User,
  deleteUser,
} from "../../modules/user";
import { UserModel } from "../../modules/user/schema";
import { get as _get } from "lodash";
import {
  GeneratedSummary,
  deleteGeneratedSummary,
  getGeneratedSummaryById,
  getGeneratedSummaryByUserId,
} from "../../modules/generatedSummary";

export default class Controller {
  private readonly profileUpdateSchema = Joi.object().keys({
    profileImage: Joi.string()
      .optional()
      .external(async (v: string) => {
        if (!v) return v;
        const image = await getImageById(v);
        if (!image) {
          throw new Error("Please provide valid image.");
        }
        return v;
      })
      .allow(null),
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    phone: Joi.string().optional().allow(''),
    bio: Joi.string().optional().allow(''),
    location: Joi.string().optional().allow(''),
  });

  private readonly userUpdateSchema = Joi.object().keys({
    profileImage: Joi.string()
      .optional()
      .external(async (v: string) => {
        if (!v) return v;
        const image = await getImageById(v);
        if (!image) {
          throw new Error("Please provide valid image for logo.");
        }
        return v;
      }),
    // email: Joi.string().email().optional(),
    glitter: Joi.number().optional(),
    isLogin: Joi.boolean().optional(),
  });

  private readonly downloadGeneratedImageSchema = Joi.object().keys({
    generatedSummaryURL: Joi.string().required(),
  });

  private readonly searchExploreImageSchema = Joi.object().keys({
    description: Joi.string().required(),
  });

  protected readonly update = async (req: Request, res: Response) => {
    try {
      const authUser = req.authUser;
      const payloadValue = await this.userUpdateSchema
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
      if (payloadValue.email) {
        const existingUser = await getUserByEmail(payloadValue.email);
        if (existingUser) {
          if (existingUser._id.toString() !== authUser._id.toString()) {
            return res.status(422).json({
              message:
                "This email address is already associated with another account. Please use a different email address.",
            });
          }
        }
      }
      const toBeUpdatedAccount = new User({
        ...authUser,
        ...payloadValue,
      });
      await updateUser(toBeUpdatedAccount);
      const populatedUser = await getPopulatedUserById(req.userId);
      return res.status(200).json(populatedUser);
    } catch (error) {
      console.log("error", "error at update user#################### ", error);
      return res.status(500).json({
        message: "Something happened wrong try again after sometime.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly profileUpdate = async (req: Request, res: Response) => {
    try {
      const authUser = req.authUser;
      if (!authUser) {
        return res.status(403).json("unauthorized request !");
      }

      let payloadValue;
      try {
        payloadValue = await this.profileUpdateSchema.validateAsync(req.body);
      } catch (e: any) {
        console.log("Validation error at profileUpdate:", e);
        if (isError(e)) {
          return res.status(422).json(e);
        } else {
          return res.status(422).json({ message: e.message });
        }
      }

      if (!payloadValue) {
        return res.status(400).json({ message: "Invalid request payload" });
      }

      console.log("Profile Update Payload:", payloadValue);

      // Construct update object
      const updateData: any = {};
      if (payloadValue.firstName !== undefined) updateData.firstName = payloadValue.firstName;
      if (payloadValue.lastName !== undefined) updateData.lastName = payloadValue.lastName;
      if (payloadValue.profileImage !== undefined) updateData.profileImage = payloadValue.profileImage;
      if (payloadValue.phone !== undefined) updateData.phone = payloadValue.phone;
      if (payloadValue.bio !== undefined) updateData.bio = payloadValue.bio;
      if (payloadValue.location !== undefined) updateData.location = payloadValue.location;

      // Perform update directly via Model to ensure it hits DB correctly
      await UserModel.findByIdAndUpdate(authUser._id, { $set: updateData });

      const populatedUser = await getPopulatedUserById(authUser._id);
      console.log("Updated Populated User profileImage:", populatedUser.profileImage);
      
      return res.status(200).json(populatedUser);
    } catch (error) {
      console.log(
        "error",
        "error at profileUpdate user#################### ",
        error
      );
      return res.status(500).json({
        message: "Something happened wrong try again after sometime.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly generatedSummaryOfUser = async (
    req: Request,
    res: Response
  ) => {
    try {
      const authUser = req.authUser;
      if (!authUser) {
        return res.status(403).json("unauthorized request !");
      }
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 15;
      const summaryData = await getGeneratedSummaryByUserId(
        authUser._id.toString(),
        page,
        limit
      );

      return res.status(200).json(summaryData);
    } catch (error) {
      console.log(
        "error",
        "error at get generatedSummaryOfUser#################### ",
        error
      );

      return res.status(500).json({
        message: "Something happened wrong try again after sometime.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly delete = async (req: Request, res: Response) => {
    try {
      const userId = req.params.id;
      const authUser = req.authUser;

      if (userId !== authUser._id.toString()) {
        return res.status(403).json({
          message: "You are not authorized to delete this user.",
        });
      }

      const user = await getUserById(userId);
      if (!user) {
        return res.status(404).json({
          message: "User not found.",
        });
      }
      await deleteUser(userId);
      return res.status(200).json({
        message: "User deleted successfully.",
      });
    } catch (error) {
      console.log("error", "error at delete user#################### ", error);
      return res.status(500).json({
        message: "Something happened wrong try again after sometime.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly deleteHistory = async (req: Request, res: Response) => {
    try {
      const summaryId = req.params.id;
      const authUser = req.authUser;
      if (!authUser) {
        return res.status(403).json({
          message: "unauthorized request.",
        });
      }

      const summary = await getGeneratedSummaryById(summaryId);
      if (!summary) {
        return res.status(404).json({
          message: "History not found.",
        });
      }
      await deleteGeneratedSummary(summary as any);
      return res.status(200).json({
        message: "history deleted successfully.",
      });
    } catch (error) {
      console.log(
        "error",
        "error at deleteHistory#################### ",
        error
      );
      return res.status(500).json({
        message: "Something happened wrong try again after sometime.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly getUserById = async (req: Request, res: Response) => {
    try {
      const authUser = req.authUser;
      if (!authUser) {
        return res.status(403).json({ message: "unauthorized request" });
      }
      const user = await getPopulatedUserById(authUser._id);
      return res.status(200).json(user);
    } catch (error) {
      console.log(
        "error",
        "error at get getUserById#################### ",
        error
      );
      return res.status(500).json({
        message: "Something happened wrong try again after sometime.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly profileShare = async (req: Request, res: Response) => {
    try {
      const authUser = req.authUser;
      const populatedUser = await getPopulatedUserById(authUser._id);
      return res.status(200).json(populatedUser);
    } catch (error) {
      console.log("error in profileShare####################", error);
      return res.status(500).json({
        message: "Something happened wrong try again after sometime.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly userViewCount = async (req: Request, res: Response) => {
    try {
      const authUser = req.authUser;
      if (!authUser) {
        return res.status(403).json("unauthorized Request");
      }
      const page = Number(req.query.page);
      const limit = Number(req.query.limit);
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const Id = req.params.id;
      if (!Id) {
        return res.status(422).json({ message: "Invalid Id." });
      }

      const user = await getUserById(Id);
      if (!user) {
        return res.status(422).json({ message: "Invalid userId." });
      }
      if (page == 1) {
        await updateUser(
          new User({
            ...user,
            viewCount: user.viewCount + 1,
          })
        );
      }
      const populatedUser = await getPopulatedUserById(user._id);

      return res.status(200).json([
        {
          _id: populatedUser._id,
          firstName: populatedUser.firstName,
          lastName: populatedUser.lastName,
          profileImage: populatedUser.profileImage,
          totalLength: populatedUser.generatedSummary.length,
          viewCount: populatedUser.viewCount,
          email: populatedUser.email,
          images: populatedUser.generatedSummary.slice(startIndex, endIndex),
        },
      ]);
    } catch (error) {
      console.log("########## Error in userViewCount", error);
      return res.status(500).json({
        message: "Something happened wrong try again after sometime.",
        error: _get(error, "message"),
      });
    }
  };
}
