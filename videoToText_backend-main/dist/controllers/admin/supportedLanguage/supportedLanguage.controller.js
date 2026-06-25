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
const supportedLanguage_1 = require("../../../modules/supportedLanguage");
const createAndUploadFlag_1 = require("../../../modules/supportedLanguage/createAndUploadFlag");
class Controller {
    constructor() {
        this.createSupportedLanguageSchema = joi_1.default.object().keys({
            country: joi_1.default.string().required(),
            codeForText: joi_1.default.string().required(),
        });
        this.updateSupportedLanguageSchema = joi_1.default.object().keys({
            country: joi_1.default.string().required(),
            codeForText: joi_1.default.string().required(),
        });
        this.getSupportedLanguageSchema = joi_1.default.object().keys({
            forDoc: joi_1.default.boolean().required(),
        });
        this.createSupportedLanguage = async (req, res) => {
            try {
                const authUser = req.authUser;
                if (!authUser) {
                    return res.status(403).json("unauthorized request");
                }
                const payloadValue = req.body;
                // const payloadValue = await this.createSupportedLanguageSchema
                //   .validateAsync(req.body)
                //   .then((value) => {
                //     return value;
                //   })
                //   .catch((e) => {
                //     if (isError(e)) {
                //       console.log("e", e);
                //       res.status(422).json(e);
                //     } else {
                //       res.status(422).json({ message: e.message });
                //     }
                //   });
                // if (!payloadValue) {
                //   return;
                // }
                const file = req.files[0];
                if (!file) {
                    return res.status(422).json({ message: "file is required" });
                }
                const flagUrl = await (0, createAndUploadFlag_1.createAndUploadFlag)(file);
                // payloadValue.flag = flagUrl;
                const createdSupportedLanguageForDoc = await (0, supportedLanguage_1.saveSupportedLanguage)(new supportedLanguage_1.SupportedLanguage({
                    country: payloadValue.country,
                    codeForText: payloadValue.codeForText,
                    flag: flagUrl.toString(),
                }));
                return res.status(200).json(createdSupportedLanguageForDoc);
            }
            catch (error) {
                console.log("########## Error in Getting createSupportedLanguage", error);
                return res.status(500).json({
                    message: "Something happened wrong try again after sometime.",
                    error: (0, lodash_1.get)(error, "message"),
                });
            }
        };
        this.updateSupportedLanguage = async (req, res) => {
            try {
                const authUser = req.authUser;
                if (!authUser) {
                    return res.status(403).json("unauthorized request");
                }
                const payloadValue = await this.updateSupportedLanguageSchema
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
                const updatedSupportedLanguageForDoc = await (0, supportedLanguage_1.updateSupportedLanguage)(new supportedLanguage_1.SupportedLanguage(payloadValue));
                return res.status(200).json(updatedSupportedLanguageForDoc);
            }
            catch (error) {
                console.log("########## Error in Getting updateSupportedLanguage", error);
                return res.status(500).json({
                    message: "Something happened wrong try again after sometime.",
                    error: (0, lodash_1.get)(error, "message"),
                });
            }
        };
        this.getSupportedLanguage = async (req, res) => {
            try {
                const authUser = req.authUser;
                if (!authUser) {
                    return res.status(403).json("unauthorized request");
                }
                const supportedLanguageForText = await (0, supportedLanguage_1.getAllSupportedLanguage)();
                return res.status(200).json(supportedLanguageForText);
            }
            catch (error) {
                console.log("########## Error in Getting getSupportedLanguageForDoc", error);
                return res.status(500).json({
                    message: "Something happened wrong try again after sometime.",
                    error: (0, lodash_1.get)(error, "message"),
                });
            }
        };
        this.deleteSupportedLanguage = async (req, res) => {
            try {
                const authUser = req.authUser;
                if (!authUser) {
                    return res.status(403).json("unauthorized request");
                }
                const supportedLanguageId = req.params.id;
                if (!supportedLanguageId) {
                    return res
                        .status(422)
                        .json({ message: "supportedLanguageId is required" });
                }
                const supportedLanguage = await (0, supportedLanguage_1.getSupportedLanguageById)(supportedLanguageId);
                if (!supportedLanguage) {
                    return res.status(422).json({ message: "supportedLanguage not found" });
                }
                await (0, supportedLanguage_1.deleteSupportedLanguage)(supportedLanguageId);
                return res.status(200).json({ message: "supportedLanguage deleted" });
            }
            catch (error) {
                console.log("########## Error in Getting deleteSupportedLanguage", error);
                return res.status(500).json({
                    message: "Something happened wrong try again after sometime.",
                    error: (0, lodash_1.get)(error, "message"),
                });
            }
        };
    }
}
exports.default = Controller;
//# sourceMappingURL=supportedLanguage.controller.js.map