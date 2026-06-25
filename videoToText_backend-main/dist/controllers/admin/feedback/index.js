"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const feedback_controller_1 = __importDefault(require("./feedback.controller"));
const express_1 = require("express");
class AdminFeedback extends feedback_controller_1.default {
    constructor() {
        super();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // this.router.post("/", this.create);
        // this.router.patch("/:_id", this.update);
        // this.router.delete("/:_id", this.delete);
        this.router.get("/", this.get);
    }
}
exports.default = AdminFeedback;
//# sourceMappingURL=index.js.map