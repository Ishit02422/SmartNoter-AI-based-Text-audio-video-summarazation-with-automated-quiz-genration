import { AES, enc } from "crypto-js";
import { Response } from "express";
import { Request } from "../../../request";
import Joi, { isError } from "joi";
import jwt, { Secret, JwtPayload } from "jsonwebtoken";
import {
  IUser,
  User,
  getUserByEmail,
  updateUser,
  getPopulatedUserById,
  saveUser,
} from "../../../modules/user";
import { get as _get } from "lodash";
import { checkFolderExistsWithUserId } from "../../../modules/folders/checkIfExistFolderWithUserId";
import { createFolder } from "../../../modules/folders";

export default class Controller {
  private readonly loginSchema = Joi.object({
    email: Joi.string()
      .email()
      .required()
      .external(async (v: string) => {
        const user: IUser = await getUserByEmail(v);
        if (!user) {
          throw new Error(
            "This email address is not registered. Please use a registered email address."
          );
        }
        return user;
      }),
    password: Joi.string().required(),
  });
  private readonly registerSchema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    // otp: Joi.string().length(6).required(),
    email: Joi.string()
      .email()
      .required()
      .external(async (v: string) => {
        const user: IUser = await getUserByEmail(v);
        if (user) {
          throw new Error(
            "This email address is already associated with another account. Please use a different email address."
          );
        }
        return v;
      }),
    password: Joi.string()
      .required()
      .min(6)
      .custom((v) => {
        return AES.encrypt(v, process.env.PASS_KEY).toString();
      }),

    // pushToken: Joi.string().optional().disallow(null).allow(""),
  });

  protected readonly register = async (req: Request, res: Response) => {
    try {
      const payloadValue = await this.registerSchema
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

      const user = await saveUser(
        new User({
          ...User.defaults,
          ...payloadValue,
        })
      );
      const folderExist = await checkFolderExistsWithUserId(
        user._id,
        "All Notes"
      );
      if (!folderExist) {
        await createFolder(user._id, { folderName: "All Notes" });
      }

      const newUser = await getPopulatedUserById(user._id);
      const token = jwt.sign(
        { id: user._id?.toString() },
        process.env.JWT_SECRET as Secret
      );
      return res.status(200).set({ "x-auth-token": token }).json(newUser);
    } catch (error) {
      console.log("error in register", error);
      return res.status(500).json({
        message: "Something happened wrong try again after sometime.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly login = async (req: Request, res: Response) => {
    try {
      const payloadValue = await this.loginSchema
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
      const user = payloadValue.email;
      if (user.userType !== "ADMIN") {
        return res.status(422).json({ message: "You are not admin" });
      }
      if (!user) {
        return res.status(422).json({ message: "User not found" });
      }
      const password = AES.decrypt(
        user.password,
        process.env.PASS_KEY
      ).toString(enc.Utf8);
      if (password !== payloadValue.password) {
        return res.status(422).json({ message: "Password is incorrect" });
      }

      const populatedUser = await getPopulatedUserById(user._id);

      // const token = AES.encrypt(
      //   user.email,
      //   process.env.ADMIN_AES_KEY
      // ).toString();

      const token = jwt.sign(
        { id: user._id?.toString() },
        process.env.JWT_SECRET as Secret
      );
      return res
        .status(200)
        .setHeader("x-auth-token", token)
        .json(populatedUser);
    } catch (error) {
      console.log("error", "error in Admin_Login", error);
      return res.status(500).json({
        message: "Something happened wrong try again after sometime.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly session = async (req: Request, res: Response) => {
    try {
      const isAdmin = req.isAdmin;

      if (!isAdmin) {
        return res.status(403).json({ message: "Unauthorized request." }).end();
      }
      const user = await getPopulatedUserById(req.authUser._id);
      return res.status(200).json(user);
    } catch (error) {
      console.log("error at get session#################### ", error);
      return res.status(500).json({
        message: "Something happened wrong try again after sometime.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly logout = async (req: Request, res: Response) => {
    try {
      const user = req.authUser;
      const index = user.FCMToken.indexOf(req.body.pushToken);

      user.FCMToken.splice(index, 1);
      await updateUser(new User({ ...user }));

      return res.status(200).json({ message: "Logout" });
    } catch (error) {
      console.log("error", "error in logout ", error);
      return res.status(500).json({
        message: "Something happened wrong try again after sometime.",
        error: _get(error, "message"),
      });
    }
  };
}
