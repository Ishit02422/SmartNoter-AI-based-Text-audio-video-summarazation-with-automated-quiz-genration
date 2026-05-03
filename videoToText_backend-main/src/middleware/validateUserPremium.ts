import { NextFunction, Response } from "express";
import { Request } from "../request";
import { StatusCodes } from "http-status-codes";

export const validateUserPremium = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authUser = req.authUser;

  try {
    if (authUser.userType === "USER") {
      if (authUser.isProUser && authUser.isPurchased) {
        const now = new Date();
        if (authUser.premiumExpiryDate && authUser.premiumExpiryDate < now) {
          return res.status(StatusCodes.BAD_REQUEST).json({
            message: "Your premium version has expired, please renew.",
          });
        }
        return next();
      }

      // Credits check disabled — unlimited credits for all users
      // if (authUser.dailyCredits <= 0) {
      //   return res.status(StatusCodes.BAD_REQUEST).json({
      //     message: "You have no credits left for today.",
      //   });
      // }
    }

    next();
  } catch (error) {
    console.error("❌ Error in validateUserPremium:", error.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Something went wrong, try again later.",
      error: error.message,
    });
  }
};
