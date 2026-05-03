import { Request, Response, NextFunction } from "express";
import { UserModel } from "../modules/user/schema/user.schema";

export const checkCreditLimit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authUser = (req as any).authUser;
    if (!authUser) return next();

    const user = await UserModel.findById(authUser._id);
    if (!user) return next();

    if (!(user.isProUser && user.isPurchased)) {
      if (user.dailyCredits <= 0) {
        return res.status(402).json({ message: "INSUFFICIENT_CREDITS" });
      }
    }
    next();
  } catch (error) {
    next();
  }
};
