"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.History = exports.getModelByName = exports.modelNames = void 0;
const lodash_1 = require("lodash");
exports.modelNames = [
    "flashcards",
    "generatedsummaryaudios",
    "generatedsummaryfromwebs",
    "generatedsummaryvideos",
    "generatesummarypdfs",
    "generatedsummaryfromtexts",
    "mindmaps",
    "quizzes",
    "translates",
];
exports.getModelByName = {
    FlashCard: "flashcards",
    SummaryAudio: "generatedsummaryaudios",
    SummaryVideo: "generatedsummaryvideos",
    SummaryPDF: "generatesummarypdfs",
    SummaryWeb: "generatedsummaryfromwebs",
    SummaryText: "generatedsummaryfromtexts",
    MindMap: "mindmaps",
    Quiz: "quizzes",
    Translate: "translates",
};
class History {
    constructor(input) {
        Object.assign(this, input);
    }
    toJSON() {
        return (0, lodash_1.omitBy)(this, lodash_1.isUndefined);
    }
    toComparable() {
        return (0, lodash_1.omitBy)(this, lodash_1.isNil);
    }
}
exports.History = History;
//# sourceMappingURL=history.js.map