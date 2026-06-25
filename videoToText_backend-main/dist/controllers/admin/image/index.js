"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const filesUpload_1 = require("../../../middleware/filesUpload");
const image_controller_1 = __importDefault(require("./image.controller"));
class AdminImage extends image_controller_1.default {
    constructor() {
        super();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post("/", filesUpload_1.filesUpload, this.createImage);
        this.router.post("/uploadJson", filesUpload_1.filesUpload, this.uploadJson);
    }
}
exports.default = AdminImage;
//# sourceMappingURL=index.js.map