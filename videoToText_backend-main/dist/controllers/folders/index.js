"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validateAuthIdToken_1 = require("../../middleware/validateAuthIdToken");
const folder_1 = __importDefault(require("./folder"));
class Folder extends folder_1.default {
    constructor() {
        super();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post("/", validateAuthIdToken_1.validateAuthIdToken, this.create);
        this.router.get("/", validateAuthIdToken_1.validateAuthIdToken, this.get);
        this.router.get("/:id", validateAuthIdToken_1.validateAuthIdToken, this.getById);
        this.router.patch("/:id", validateAuthIdToken_1.validateAuthIdToken, this.update);
        this.router.delete("/:id", validateAuthIdToken_1.validateAuthIdToken, this.delete);
        this.router.post("/move-note", validateAuthIdToken_1.validateAuthIdToken, this.moveNotesToFolder);
    }
}
exports.default = Folder;
//# sourceMappingURL=index.js.map