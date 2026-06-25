"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const allSummary_1 = require("./allSummary");
class Summaries extends allSummary_1.Controller {
    constructor() {
        super();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/", this.getSummaries);
        this.router.post("/export", this.export);
    }
}
exports.default = Summaries;
//# sourceMappingURL=index.js.map