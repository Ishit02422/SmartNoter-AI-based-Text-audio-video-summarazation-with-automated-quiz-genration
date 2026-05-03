import { AudioModel } from "../audio/schema";
import { ChatWithAiModel } from "../chatWithAI/schema";
import { FlashCardModel } from "../flashcard/schema";
import { checkIfNotesExistsInFolder } from "../folders";
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
import { IUser, User } from "./types";

export const transferData = async (guestUser: User, newUser: IUser) => {
  const query = { userId: guestUser._id.toString() };
  const update = { userId: newUser._id.toString() };

  await Promise.all([
    AudioModel.updateMany(query, update),
    ChatWithAiModel.updateMany(query, update),
    FlashCardModel.updateMany(query, update),
    FolderModel.updateMany(query, update),
    HistoryModel.updateMany(query, update),
    ImageModel.updateMany(query, update),
    MindMapModel.updateMany(query, update),
    PdfModel.updateMany(query, update),
    QuizModel.updateMany(query, update),
    RewardModel.updateMany(query, update),
    TranslateModel.updateMany(query, update),
    VideoModel.updateMany(query, update),

    // summaries
    GeneratedSummaryAudioModel.updateMany(query, update),
    GenerateSummyPdfModel.updateMany(query, update),
    GeneratedSummaryModel.updateMany(query, update),
    GeneratedSummaryWebModel.updateMany(query, update),
    GeneratedSummaryTextModel.updateMany(query, update),
  ]);
};

