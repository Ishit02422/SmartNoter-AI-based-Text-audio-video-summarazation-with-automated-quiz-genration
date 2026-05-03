import { AudioModel } from "../audio/schema";
import { ChatWithAiModel } from "../chatWithAI/schema";
import { FlashCardModel } from "../flashcard/schema";
import { FolderModel } from "../folders/schema";
import { GeneratedSummaryAudioModel } from "../generatedSummaryFromAudio/schema";
import { GenerateSummyPdfModel } from "../generatedSummaryFromPdf/schema";
import { GeneratedSummaryWebModel } from "../generatedSummaryFromWeb";
import { GeneratedSummaryTextModel } from "../generateSummaryFromText";
import { GeneratedSummaryModel } from "../generateSummaryFromYoutube/schema";
import { HistoryModel } from "../history/schema";
import { ImageModel } from "../image/schema";
import { MindMapModel } from "../mindMap/schema";
import { PdfModel } from "../pdf/schema";
import { QuizModel } from "../quiz/schema";
import { RewardModel } from "../rewards/schema";
import { TranslateModel } from "../translate/schema";
import { VideoModel } from "../video/schema";
import { UserModel } from "./schema";
import { transferData } from "./transferData";

/**
 * will delete user
 * @param _id
 */
export const deleteUser = async (_id: string) => {
  await UserModel.findByIdAndDelete(_id);

  await Promise.all([
    AudioModel.deleteMany({ userId: _id }),
    ChatWithAiModel.deleteMany({ userId: _id }),
    FlashCardModel.deleteMany({ userId: _id }),
    FolderModel.deleteMany({ userId: _id }),
    HistoryModel.deleteMany({ userId: _id }),
    ImageModel.deleteMany({ userId: _id }),
    MindMapModel.deleteMany({ userId: _id }),
    PdfModel.deleteMany({ userId: _id }),
    QuizModel.deleteMany({ userId: _id }),
    RewardModel.deleteMany({ userId: _id }),
    TranslateModel.deleteMany({ userId: _id }),
    VideoModel.deleteMany({ userId: _id }),

    // 🔥 delete all summaries (not just one)
    GeneratedSummaryAudioModel.deleteMany({ userId: _id }),
    GenerateSummyPdfModel.deleteMany({ userId: _id }),
    GeneratedSummaryModel.deleteMany({ userId: _id }),
    GeneratedSummaryWebModel.deleteMany({ userId: _id }),
    GeneratedSummaryTextModel.deleteMany({ userId: _id }),
  ]);
};
