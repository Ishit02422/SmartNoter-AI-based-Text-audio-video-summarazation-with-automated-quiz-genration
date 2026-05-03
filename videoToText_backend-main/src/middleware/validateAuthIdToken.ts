import { AES, enc } from "crypto-js";
import { NextFunction, Response } from "express";
import { Request } from "./../request";
import { getUserById, User, getUserByFirebaseUserId } from "../modules/user";
// import { set as setGlobalContext } from "express-http-context";

export const validateAuthIdToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token =
    req.headers.authorization ||
    req.signedCookies.auth ||
    req.signedCookies.admin_auth;

  if (typeof token === 'string' && token.startsWith('Bearer ')) {
    token = token.slice(7).trim();
  }

  if (!token || token === "null" || token === "undefined") {
    res.clearCookie("admin_auth", {
      signed: true,
    });
    res
      .clearCookie("auth", {
        signed: true,
      })
      .status(403)
      .json({ message: "Unauthorized request." });
    return;
  }
  // console.log(token);
  let userId: string | null = null;
  try {
    const decrypted = AES.decrypt(token, process.env.AES_KEY).toString(enc.Utf8);
    if (decrypted) userId = decrypted;
  } catch (err) {
    // If AES fails, maybe it's a Firebase ID token
  }

  if (!userId) {
    try {
      const { getAuth } = require('firebase-admin/auth');
      const decodedToken = await getAuth().verifyIdToken(token);

      const firebaseUser = await getUserByFirebaseUserId(decodedToken.uid);
      if (firebaseUser) {
        userId = firebaseUser._id.toString();
      }
    } catch (err) {
      if (token && token.length > 20) {
        console.log("Firebase token auth failed:", err.message || err);
      }
    }
  }

  if (!userId) {
    res.clearCookie("admin_auth", {
      signed: true,
    });
    res
      .clearCookie("auth", {
        signed: true,
      })
      .status(403)
      .json({ message: "Unauthorized request." });
    return;
  }

  const user: User = await getUserById(userId);

  if (!user) {
    res.clearCookie("admin_auth", {
      signed: true,
    });
    res
      .clearCookie("auth", {
        signed: true,
      })
      .status(403)
      .json({ message: "Unauthorized request." });
    return;
  }
  const userRawData = user.toJSON();
  delete userRawData.password;

  req.authUser = userRawData;
  req.isAdmin = userRawData.userType === "ADMIN";
  // setGlobalContext("authUser", userRawData);
  next();
  return;
};
