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
const express_1 = __importStar(require("express"));
const validateAuthIdToken_1 = require("../../middleware/validateAuthIdToken");
const validateIsAdmin_1 = require("../../middleware/validateIsAdmin");
const auth_1 = __importDefault(require("./auth"));
const feedback_1 = __importDefault(require("./feedback"));
const user_1 = __importDefault(require("./user"));
const image_1 = __importDefault(require("./image"));
const inspiration_1 = __importDefault(require("./inspiration"));
const supportedLanguage_1 = __importDefault(require("./supportedLanguage"));
class Admin {
    constructor() {
        this.router = (0, express_1.Router)();
        this.instance = (0, express_1.default)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.instance.use("/user", validateAuthIdToken_1.validateAuthIdToken, validateIsAdmin_1.validateIsAdmin, new user_1.default().router);
        this.instance.use("/auth", new auth_1.default().router);
        this.instance.use("/image", validateAuthIdToken_1.validateAuthIdToken, validateIsAdmin_1.validateIsAdmin, new image_1.default().router);
        this.instance.use("/feedback", validateAuthIdToken_1.validateAuthIdToken, validateIsAdmin_1.validateIsAdmin, new feedback_1.default().router);
        this.instance.use("/inspiration", validateAuthIdToken_1.validateAuthIdToken, validateIsAdmin_1.validateIsAdmin, new inspiration_1.default().router);
        this.instance.use("/supportedLanguage", new supportedLanguage_1.default().router);
    }
}
exports.default = Admin;
//# sourceMappingURL=index.js.map