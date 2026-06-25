"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transferData = void 0;
const schema_1 = require("../audio/schema");
const schema_2 = require("../chatWithAI/schema");
const schema_3 = require("../flashcard/schema");
const schema_4 = require("../folders/schema");
const schema_5 = require("../generatedSummaryFromAudio/schema");
const schema_6 = require("../generatedSummaryFromPdf/schema");
const generatedSummaryFromWeb_1 = require("../generatedSummaryFromWeb");
const generateSummaryFromText_1 = require("../generateSummaryFromText");
const schema_7 = require("../generateSummaryFromYoutube/schema");
const schema_8 = require("../history/schema");
const schema_9 = require("../image/schema");
const schema_10 = require("../mindMap/schema");
const schema_11 = require("../pdf/schema");
const schema_12 = require("../quiz/schema");
const schema_13 = require("../rewards/schema");
const schema_14 = require("../translate/schema");
const schema_15 = require("../video/schema");
const transferData = async (guestUser, newUser) => {
    const query = { userId: guestUser._id.toString() };
    const update = { userId: newUser._id.toString() };
    await Promise.all([
        schema_1.AudioModel.updateMany(query, update),
        schema_2.ChatWithAiModel.updateMany(query, update),
        schema_3.FlashCardModel.updateMany(query, update),
        schema_4.FolderModel.updateMany(query, update),
        schema_8.HistoryModel.updateMany(query, update),
        schema_9.ImageModel.updateMany(query, update),
        schema_10.MindMapModel.updateMany(query, update),
        schema_11.PdfModel.updateMany(query, update),
        schema_12.QuizModel.updateMany(query, update),
        schema_13.RewardModel.updateMany(query, update),
        schema_14.TranslateModel.updateMany(query, update),
        schema_15.VideoModel.updateMany(query, update),
        // summaries
        schema_5.GeneratedSummaryAudioModel.updateMany(query, update),
        schema_6.GenerateSummyPdfModel.updateMany(query, update),
        schema_7.GeneratedSummaryModel.updateMany(query, update),
        generatedSummaryFromWeb_1.GeneratedSummaryWebModel.updateMany(query, update),
        generateSummaryFromText_1.GeneratedSummaryTextModel.updateMany(query, update),
    ]);
};
exports.transferData = transferData;
//# sourceMappingURL=transferData.js.map