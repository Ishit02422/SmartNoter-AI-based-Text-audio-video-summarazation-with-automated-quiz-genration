"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const history_1 = __importDefault(require("./history"));
const validateAuthIdToken_1 = require("../../middleware/validateAuthIdToken");
class History extends history_1.default {
    constructor() {
        super();
        this.router = (0, express_1.Router)();
        this.initilizeRoutes();
    }
    initilizeRoutes() {
        this.router.get("/", validateAuthIdToken_1.validateAuthIdToken, this.get);
    }
}
exports.default = History;
//# sourceMappingURL=index.js.map