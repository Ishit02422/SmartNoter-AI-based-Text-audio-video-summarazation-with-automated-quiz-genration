"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAuthIdToken = void 0;
const crypto_js_1 = require("crypto-js");
const user_1 = require("../modules/user");
// import { set as setGlobalContext } from "express-http-context";
const validateAuthIdToken = async (req, res, next) => {
    let token = req.headers.authorization ||
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
    let userId = null;
    try {
        const decrypted = crypto_js_1.AES.decrypt(token, process.env.AES_KEY).toString(crypto_js_1.enc.Utf8);
        if (decrypted)
            userId = decrypted;
    }
    catch (err) {
        // If AES fails, maybe it's a Firebase ID token
    }
    if (!userId) {
        try {
            const { getAuth } = require('firebase-admin/auth');
            const decodedToken = await getAuth().verifyIdToken(token);
            const firebaseUser = await (0, user_1.getUserByFirebaseUserId)(decodedToken.uid);
            if (firebaseUser) {
                userId = firebaseUser._id.toString();
            }
        }
        catch (err) {
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
    const user = await (0, user_1.getUserById)(userId);
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
exports.validateAuthIdToken = validateAuthIdToken;
//# sourceMappingURL=validateAuthIdToken.js.map