"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = void 0;
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
const schema_16 = require("./schema");
/**
 * will delete user
 * @param _id
 */
const deleteUser = async (_id) => {
    await schema_16.UserModel.findByIdAndDelete(_id);
    await Promise.all([
        schema_1.AudioModel.deleteMany({ userId: _id }),
        schema_2.ChatWithAiModel.deleteMany({ userId: _id }),
        schema_3.FlashCardModel.deleteMany({ userId: _id }),
        schema_4.FolderModel.deleteMany({ userId: _id }),
        schema_8.HistoryModel.deleteMany({ userId: _id }),
        schema_9.ImageModel.deleteMany({ userId: _id }),
        schema_10.MindMapModel.deleteMany({ userId: _id }),
        schema_11.PdfModel.deleteMany({ userId: _id }),
        schema_12.QuizModel.deleteMany({ userId: _id }),
        schema_13.RewardModel.deleteMany({ userId: _id }),
        schema_14.TranslateModel.deleteMany({ userId: _id }),
        schema_15.VideoModel.deleteMany({ userId: _id }),
        // 🔥 delete all summaries (not just one)
        schema_5.GeneratedSummaryAudioModel.deleteMany({ userId: _id }),
        schema_6.GenerateSummyPdfModel.deleteMany({ userId: _id }),
        schema_7.GeneratedSummaryModel.deleteMany({ userId: _id }),
        generatedSummaryFromWeb_1.GeneratedSummaryWebModel.deleteMany({ userId: _id }),
        generateSummaryFromText_1.GeneratedSummaryTextModel.deleteMany({ userId: _id }),
    ]);
};
exports.deleteUser = deleteUser;
//# sourceMappingURL=deleteUser.js.map