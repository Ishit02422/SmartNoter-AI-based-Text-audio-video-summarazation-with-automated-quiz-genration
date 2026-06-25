"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const filesUpload_1 = require("../../middleware/filesUpload");
const image_controller_1 = __importDefault(require("./image.controller"));
class Image extends image_controller_1.default {
    constructor() {
        super();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post("", filesUpload_1.filesUpload, this.createImage);
        this.router.post("/imageToPrompt", filesUpload_1.filesUpload, this.createImageForImageToPrompt);
    }
}
exports.default = Image;
//# sourceMappingURL=index.js.map