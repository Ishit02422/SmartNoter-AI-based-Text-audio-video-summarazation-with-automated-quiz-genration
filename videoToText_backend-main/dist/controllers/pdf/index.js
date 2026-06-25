"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pdf = void 0;
const express_1 = require("express");
const controller_1 = __importDefault(require("./controller"));
const filesUpload_1 = require("../../middleware/filesUpload");
class Pdf extends controller_1.default {
    constructor() {
        super();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post("", filesUpload_1.filesUpload, this.createPdf);
    }
}
exports.Pdf = Pdf;
//# sourceMappingURL=index.js.map