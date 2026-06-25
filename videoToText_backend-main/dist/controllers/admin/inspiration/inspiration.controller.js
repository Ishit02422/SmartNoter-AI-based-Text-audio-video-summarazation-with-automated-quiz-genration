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
const lodash_1 = require("lodash");
const generatedSummary_1 = require("../../../modules/generatedSummary");
const inspiration_1 = require("../../../modules/inspiration");
class Controller {
    constructor() {
        this.createInspirationSchema = joi_1.default.object().keys({
            generatedSummaryId: joi_1.default.string()
                .optional()
                .external(async (value) => {
                if (!value) {
                    return value;
                }
                const generatedSummary = await (0, generatedSummary_1.getGeneratedSummaryById)(value);
                if (!generatedSummary) {
                    throw new Error("Invalid generatedSummaryId");
                }
                return value;
            }),
            category: joi_1.default.string().required(),
        });
        this.inspirationUpdateSchema = joi_1.default.object().keys({
            generatedImageId: joi_1.default.string()
                .required()
                .external(async (value) => {
                if (!value) {
                    return value;
                }
                const generatedImage = await (0, generatedSummary_1.getGeneratedSummaryById)(value);
                if (!generatedImage) {
                    throw new Error("Invalid generatedImageId");
                }
                return value;
            }),
            category: joi_1.default.string().required(),
        });
        this.create = async (req, res) => {
            try {
                const payloadValue = await this.createInspirationSchema
                    .validateAsync(req.body)
                    .then((value) => {
                    return value;
                })
                    .catch((e) => {
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
                const inspiration = await (0, inspiration_1.saveInspiration)(new inspiration_1.Inspiration({ ...payloadValue }));
                return res.status(200).json(inspiration);
            }
            catch (error) {
                console.log("error", "error in create inspiration", error);
                return res.status(500).json({
                    message: "Something happened wrong try again after sometime.",
                    error: JSON.stringify(error),
                });
            }
        };
        this.getCategory = async (req, res) => {
            try {
                const category = [
                    "Motivation",
                    "Inspiration",
                    "Happiness",
                    "Love",
                    "Life",
                    "Success",
                    "Relationship",
                    "Friendship",
                    "Money",
                    "Health",
                    "Humor",
                    "Leadership",
                    "Education",
                    "Work",
                    "Art",
                    "Science",
                    "Technology",
                    "Sports",
                    "Music",
                    "Movies",
                    "Books",
                    "Travel",
                    "Food",
                    "Fashion",
                    "Nature",
                    "Animals",
                    "Spirituality",
                    "Religion",
                    "Politics",
                ];
                return res.status(200).send(category);
            }
            catch (err) {
                console.log("########## Error in getCategory", err);
                return res.status(500).json({ error: (0, lodash_1.get)(err, "message") });
            }
        };
        this.getByCategory = async (req, res) => {
            try {
                const category = req.params.category;
                if (!category) {
                    return res.status(422).json({ message: "Invalid category." });
                }
                const inspiration = await (0, inspiration_1.getInspirationByCategory)(category);
                return res.status(200).send(inspiration);
            }
            catch (err) {
                console.log("########## Error in getByCategory", err);
                return res.status(500).json({ error: (0, lodash_1.get)(err, "message") });
            }
        };
        this.update = async (req, res) => {
            try {
                const id = req.params.id;
                if (!id) {
                    return res.status(422).json({ message: "Invalid Id." });
                }
                const payloadValue = await this.inspirationUpdateSchema
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
                const inspiration = await (0, inspiration_1.getInspirationById)(id);
                const toBeUpdateInspiration = new inspiration_1.Inspiration({
                    ...inspiration,
                    ...payloadValue,
                });
                const updateData = await (0, inspiration_1.updateInspiration)(toBeUpdateInspiration);
                return res.status(200).json(updateData);
            }
            catch (error) {
                console.log("error", "error in update inspiration", error);
                return res.status(500).json({
                    message: "Something happened wrong try again after sometime.",
                    error: JSON.stringify(error),
                });
            }
        };
        this.delete = async (req, res) => {
            try {
                const inspirationId = req.params.id;
                if (!inspirationId) {
                    return res
                        .status(422)
                        .json({ message: "Please provide inspirationId" });
                }
                const inspiration = await (0, inspiration_1.getInspirationById)(inspirationId);
                if (!inspiration) {
                    return res.status(422).json({ message: "Invalid Id." });
                }
                await (0, inspiration_1.deleteInspiration)(inspirationId);
                return res.status(200).json("deleted successfully");
            }
            catch (error) {
                console.log("error", "error in delete inspiration", error);
                return res.status(500).json({
                    message: "Something happened wrong try again after sometime.",
                    error: JSON.stringify(error),
                });
            }
        };
        this.get = async (req, res) => {
            try {
                const inspirationId = req.params._id;
                if (inspirationId) {
                    const inspiration = await (0, inspiration_1.getInspirationById)(inspirationId);
                    return res.status(200).json(inspiration);
                }
                const inspiration = await (0, inspiration_1.getInspiration)();
                return res.status(200).json(inspiration);
            }
            catch (error) {
                console.log("########## Error in Getting inspiration", error);
                return res.status(500).json({
                    message: "Something happened wrong try again after sometime.",
                    error: (0, lodash_1.get)(error, "message"),
                });
            }
        };
    }
}
exports.default = Controller;
//# sourceMappingURL=inspiration.controller.js.map