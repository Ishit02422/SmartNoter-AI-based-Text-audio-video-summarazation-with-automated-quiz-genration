"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const inspiration_controller_1 = __importDefault(require("./inspiration.controller"));
const express_1 = require("express");
class Inspiration extends inspiration_controller_1.default {
    constructor() {
        super();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/getCategory", this.getCategory);
        this.router.get("/get/:category", this.get);
        this.router.get("/:id", this.getById);
    }
}
exports.default = Inspiration;
//# sourceMappingURL=index.js.map