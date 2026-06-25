"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const validateAuthIdToken_1 = require("../../middleware/validateAuthIdToken");
const user_controller_1 = __importDefault(require("./user.controller"));
const express_1 = require("express");
class User extends user_controller_1.default {
    constructor() {
        super();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/", validateAuthIdToken_1.validateAuthIdToken, this.getUserById);
        this.router.get("/getProfile", validateAuthIdToken_1.validateAuthIdToken, this.getUserById);
        this.router.get("/generatedSummary", validateAuthIdToken_1.validateAuthIdToken, this.generatedSummaryOfUser);
        this.router.delete("/deleteHistory/:id", validateAuthIdToken_1.validateAuthIdToken, this.deleteHistory);
        this.router.delete("/:id", validateAuthIdToken_1.validateAuthIdToken, this.delete);
        this.router.patch("/", validateAuthIdToken_1.validateAuthIdToken, this.profileUpdate);
    }
}
exports.default = User;
//# sourceMappingURL=index.js.map