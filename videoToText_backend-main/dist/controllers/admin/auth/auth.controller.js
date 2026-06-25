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
const crypto_js_1 = require("crypto-js");
const joi_1 = __importStar(require("joi"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = require("../../../modules/user");
const lodash_1 = require("lodash");
const checkIfExistFolderWithUserId_1 = require("../../../modules/folders/checkIfExistFolderWithUserId");
const folders_1 = require("../../../modules/folders");
class Controller {
    constructor() {
        this.loginSchema = joi_1.default.object({
            email: joi_1.default.string()
                .email()
                .required()
                .external(async (v) => {
                const user = await (0, user_1.getUserByEmail)(v);
                if (!user) {
                    throw new Error("This email address is not registered. Please use a registered email address.");
                }
                return user;
            }),
            password: joi_1.default.string().required(),
        });
        this.registerSchema = joi_1.default.object({
            firstName: joi_1.default.string().required(),
            lastName: joi_1.default.string().required(),
            // otp: Joi.string().length(6).required(),
            email: joi_1.default.string()
                .email()
                .required()
                .external(async (v) => {
                const user = await (0, user_1.getUserByEmail)(v);
                if (user) {
                    throw new Error("This email address is already associated with another account. Please use a different email address.");
                }
                return v;
            }),
            password: joi_1.default.string()
                .required()
                .min(6)
                .custom((v) => {
                return crypto_js_1.AES.encrypt(v, process.env.PASS_KEY).toString();
            }),
            // pushToken: Joi.string().optional().disallow(null).allow(""),
        });
        this.register = async (req, res) => {
            var _a;
            try {
                const payloadValue = await this.registerSchema
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
                const user = await (0, user_1.saveUser)(new user_1.User({
                    ...user_1.User.defaults,
                    ...payloadValue,
                }));
                const folderExist = await (0, checkIfExistFolderWithUserId_1.checkFolderExistsWithUserId)(user._id, "All Notes");
                if (!folderExist) {
                    await (0, folders_1.createFolder)(user._id, { folderName: "All Notes" });
                }
                const newUser = await (0, user_1.getPopulatedUserById)(user._id);
                const token = jsonwebtoken_1.default.sign({ id: (_a = user._id) === null || _a === void 0 ? void 0 : _a.toString() }, process.env.JWT_SECRET);
                return res.status(200).set({ "x-auth-token": token }).json(newUser);
            }
            catch (error) {
                console.log("error in register", error);
                return res.status(500).json({
                    message: "Something happened wrong try again after sometime.",
                    error: (0, lodash_1.get)(error, "message"),
                });
            }
        };
        this.login = async (req, res) => {
            var _a;
            try {
                const payloadValue = await this.loginSchema
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
                const user = payloadValue.email;
                if (user.userType !== "ADMIN") {
                    return res.status(422).json({ message: "You are not admin" });
                }
                if (!user) {
                    return res.status(422).json({ message: "User not found" });
                }
                const password = crypto_js_1.AES.decrypt(user.password, process.env.PASS_KEY).toString(crypto_js_1.enc.Utf8);
                if (password !== payloadValue.password) {
                    return res.status(422).json({ message: "Password is incorrect" });
                }
                const populatedUser = await (0, user_1.getPopulatedUserById)(user._id);
                // const token = AES.encrypt(
                //   user.email,
                //   process.env.ADMIN_AES_KEY
                // ).toString();
                const token = jsonwebtoken_1.default.sign({ id: (_a = user._id) === null || _a === void 0 ? void 0 : _a.toString() }, process.env.JWT_SECRET);
                return res
                    .status(200)
                    .setHeader("x-auth-token", token)
                    .json(populatedUser);
            }
            catch (error) {
                console.log("error", "error in Admin_Login", error);
                return res.status(500).json({
                    message: "Something happened wrong try again after sometime.",
                    error: (0, lodash_1.get)(error, "message"),
                });
            }
        };
        this.session = async (req, res) => {
            try {
                const isAdmin = req.isAdmin;
                if (!isAdmin) {
                    return res.status(403).json({ message: "Unauthorized request." }).end();
                }
                const user = await (0, user_1.getPopulatedUserById)(req.authUser._id);
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
        this.logout = async (req, res) => {
            try {
                const user = req.authUser;
                const index = user.FCMToken.indexOf(req.body.pushToken);
                user.FCMToken.splice(index, 1);
                await (0, user_1.updateUser)(new user_1.User({ ...user }));
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
    }
}
exports.default = Controller;
//# sourceMappingURL=auth.controller.js.map