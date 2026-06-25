"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const inspiration_controller_1 = __importDefault(require("./inspiration.controller"));
const express_1 = require("express");
class AdminInspiration extends inspiration_controller_1.default {
    constructor() {
        super();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post("/", this.create);
        this.router.patch("/:id", this.update);
        this.router.delete("/:id", this.delete);
        this.router.get("/", this.get);
        this.router.get("/:id", this.get);
        this.router.get("/getCategory", this.getCategory);
        this.router.get("/getByCategory/:category", this.getByCategory);
    }
}
exports.default = AdminInspiration;
//# sourceMappingURL=index.js.map