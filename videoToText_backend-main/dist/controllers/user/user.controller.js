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
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importStar(require("joi"));
const image_1 = require("../../modules/image");
const user_1 = require("../../modules/user");
const schema_1 = require("../../modules/user/schema");
const lodash_1 = require("lodash");
const generatedSummary_1 = require("../../modules/generatedSummary");
class Controller {
    constructor() {
        this.profileUpdateSchema = joi_1.default.object().keys({
            profileImage: joi_1.default.string()
                .optional()
                .external(async (v) => {
                if (!v)
                    return v;
                const image = await (0, image_1.getImageById)(v);
                if (!image) {
                    throw new Error("Please provide valid image.");
                }
                return v;
            })
                .allow(null),
            firstName: joi_1.default.string().optional(),
            lastName: joi_1.default.string().optional(),
            phone: joi_1.default.string().optional().allow(''),
            bio: joi_1.default.string().optional().allow(''),
            location: joi_1.default.string().optional().allow(''),
            gender: joi_1.default.string().optional().allow(''),
            dob: joi_1.default.date().optional().allow(null, ''),
            profession: joi_1.default.string().optional().allow(''),
        });
        this.userUpdateSchema = joi_1.default.object().keys({
            profileImage: joi_1.default.string()
                .optional()
                .external(async (v) => {
                if (!v)
                    return v;
                const image = await (0, image_1.getImageById)(v);
                if (!image) {
                    throw new Error("Please provide valid image for logo.");
                }
                return v;
            }),
            // email: Joi.string().email().optional(),
            glitter: joi_1.default.number().optional(),
            isLogin: joi_1.default.boolean().optional(),
        });
        this.downloadGeneratedImageSchema = joi_1.default.object().keys({
            generatedSummaryURL: joi_1.default.string().required(),
        });
        this.searchExploreImageSchema = joi_1.default.object().keys({
            description: joi_1.default.string().required(),
        });
        this.update = async (req, res) => {
            try {
                const authUser = req.authUser;
                const payloadValue = await this.userUpdateSchema
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
                if (payloadValue.email) {
                    const existingUser = await (0, user_1.getUserByEmail)(payloadValue.email);
                    if (existingUser) {
                        if (existingUser._id.toString() !== authUser._id.toString()) {
                            return res.status(422).json({
                                message: "This email address is already associated with another account. Please use a different email address.",
                            });
                        }
                    }
                }
                const toBeUpdatedAccount = new user_1.User({
                    ...authUser,
                    ...payloadValue,
                });
                await (0, user_1.updateUser)(toBeUpdatedAccount);
                const populatedUser = await (0, user_1.getPopulatedUserById)(req.userId);
                return res.status(200).json(populatedUser);
            }
            catch (error) {
                console.log("error", "error at update user#################### ", error);
                return res.status(500).json({
                    message: "Something happened wrong try again after sometime.",
                    error: (0, lodash_1.get)(error, "message"),
                });
            }
        };
        this.profileUpdate = async (req, res) => {
            try {
                const authUser = req.authUser;
                if (!authUser) {
                    return res.status(403).json("unauthorized request !");
                }
                let payloadValue;
                try {
                    payloadValue = await this.profileUpdateSchema.validateAsync(req.body);
                }
                catch (e) {
                    console.log("Validation error at profileUpdate:", e);
                    if ((0, joi_1.isError)(e)) {
                        return res.status(422).json(e);
                    }
                    else {
                        return res.status(422).json({ message: e.message });
                    }
                }
                if (!payloadValue) {
                    return res.status(400).json({ message: "Invalid request payload" });
                }
                console.log("Profile Update Payload:", payloadValue);
                // Construct update object
                const updateData = {};
                if (payloadValue.firstName !== undefined)
                    updateData.firstName = payloadValue.firstName;
                if (payloadValue.lastName !== undefined)
                    updateData.lastName = payloadValue.lastName;
                if (payloadValue.profileImage !== undefined)
                    updateData.profileImage = payloadValue.profileImage;
                if (payloadValue.phone !== undefined)
                    updateData.phone = payloadValue.phone;
                if (payloadValue.bio !== undefined)
                    updateData.bio = payloadValue.bio;
                if (payloadValue.location !== undefined)
                    updateData.location = payloadValue.location;
                if (payloadValue.gender !== undefined)
                    updateData.gender = payloadValue.gender;
                if (payloadValue.dob !== undefined)
                    updateData.dob = payloadValue.dob;
                if (payloadValue.profession !== undefined)
                    updateData.profession = payloadValue.profession;
                // Perform update directly via Model to ensure it hits DB correctly
                await schema_1.UserModel.findByIdAndUpdate(authUser._id, { $set: updateData });
                const populatedUser = await (0, user_1.getPopulatedUserById)(authUser._id);
                console.log("Updated Populated User profileImage:", populatedUser.profileImage);
                return res.status(200).json(populatedUser);
            }
            catch (error) {
                console.log("error", "error at profileUpdate user#################### ", error);
                return res.status(500).json({
                    message: "Something happened wrong try again after sometime.",
                    error: (0, lodash_1.get)(error, "message"),
                });
            }
        };
        this.generatedSummaryOfUser = async (req, res) => {
            try {
                const authUser = req.authUser;
                if (!authUser) {
                    return res.status(403).json("unauthorized request !");
                }
                const page = Number(req.query.page) || 1;
                const limit = Number(req.query.limit) || 15;
                const summaryData = await (0, generatedSummary_1.getGeneratedSummaryByUserId)(authUser._id.toString(), page, limit);
                return res.status(200).json(summaryData);
            }
            catch (error) {
                console.log("error", "error at get generatedSummaryOfUser#################### ", error);
                return res.status(500).json({
                    message: "Something happened wrong try again after sometime.",
                    error: (0, lodash_1.get)(error, "message"),
                });
            }
        };
        this.delete = async (req, res) => {
            try {
                const userId = req.params.id;
                const authUser = req.authUser;
                if (userId !== authUser._id.toString()) {
                    return res.status(403).json({
                        message: "You are not authorized to delete this user.",
                    });
                }
                const user = await (0, user_1.getUserById)(userId);
                if (!user) {
                    return res.status(404).json({
                        message: "User not found.",
                    });
                }
                await (0, user_1.deleteUser)(userId);
                return res.status(200).json({
                    message: "User deleted successfully.",
                });
            }
            catch (error) {
                console.log("error", "error at delete user#################### ", error);
                return res.status(500).json({
                    message: "Something happened wrong try again after sometime.",
                    error: (0, lodash_1.get)(error, "message"),
                });
            }
        };
        this.deleteHistory = async (req, res) => {
            try {
                const summaryId = req.params.id;
                const authUser = req.authUser;
                if (!authUser) {
                    return res.status(403).json({
                        message: "unauthorized request.",
                    });
                }
                const summary = await (0, generatedSummary_1.getGeneratedSummaryById)(summaryId);
                if (!summary) {
                    return res.status(404).json({
                        message: "History not found.",
                    });
                }
                await (0, generatedSummary_1.deleteGeneratedSummary)(summary);
                return res.status(200).json({
                    message: "history deleted successfully.",
                });
            }
            catch (error) {
                console.log("error", "error at deleteHistory#################### ", error);
                return res.status(500).json({
                    message: "Something happened wrong try again after sometime.",
                    error: (0, lodash_1.get)(error, "message"),
                });
            }
        };
        this.getUserById = async (req, res) => {
            try {
                const authUser = req.authUser;
                if (!authUser) {
                    return res.status(403).json({ message: "unauthorized request" });
                }
                const user = await (0, user_1.getPopulatedUserById)(authUser._id);
                return res.status(200).json(user);
            }
            catch (error) {
                console.log("error", "error at get getUserById#################### ", error);
                return res.status(500).json({
                    message: "Something happened wrong try again after sometime.",
                    error: (0, lodash_1.get)(error, "message"),
                });
            }
        };
        this.profileShare = async (req, res) => {
            try {
                const authUser = req.authUser;
                const populatedUser = await (0, user_1.getPopulatedUserById)(authUser._id);
                return res.status(200).json(populatedUser);
            }
            catch (error) {
                console.log("error in profileShare####################", error);
                return res.status(500).json({
                    message: "Something happened wrong try again after sometime.",
                    error: (0, lodash_1.get)(error, "message"),
                });
            }
        };
        this.userViewCount = async (req, res) => {
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
                const user = await (0, user_1.getUserById)(Id);
                if (!user) {
                    return res.status(422).json({ message: "Invalid userId." });
                }
                if (page == 1) {
                    await (0, user_1.updateUser)(new user_1.User({
                        ...user,
                        viewCount: user.viewCount + 1,
                    }));
                }
                const populatedUser = await (0, user_1.getPopulatedUserById)(user._id);
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
            }
            catch (error) {
                console.log("########## Error in userViewCount", error);
                return res.status(500).json({
                    message: "Something happened wrong try again after sometime.",
                    error: (0, lodash_1.get)(error, "message"),
                });
            }
        };
    }
}
exports.default = Controller;
//# sourceMappingURL=user.controller.js.map