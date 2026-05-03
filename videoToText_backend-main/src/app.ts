import cors from "cors";
import express, { Request, Response } from "express";
import Admin from "./controllers/admin";
import Auth from "./controllers/auth";
import Feedback from "./controllers/feedback";
import Image from "./controllers/image";
import InApp from "./controllers/inApp";
import Inspiration from "./controllers/inspiration";
import User from "./controllers/user";
import GeneratedSummary from "./controllers/generatedSummary";
import SupportedLanguage from "./controllers/supportedLanguage";
import Audio from "./controllers/audio";
import { firebase } from "./helper/firebase";
import { validateAuthIdToken } from "./middleware/validateAuthIdToken";
import { checkCreditLimit } from "./middleware/checkCreditLimit";
import GenerateSummaryFromVideo from "./controllers/generateSummaryFromYoutube";
import GenerateSummaryAudio from "./controllers/generateSummaryAudio";
import GenerateSummaryPdf from "./controllers/generatedSummaryPDF";
import { Pdf } from "./controllers/pdf";
import Folder from "./controllers/folders";
import { Translate } from "./controllers/translate";
import ChatWithAI from "./controllers/chatWithAI";
import { FlashCard } from "./controllers/flashcard";
import { Quiz } from "./controllers/quiz";
import { MindMap } from "./controllers/mindMap";
import say from "say";
import { AudioSummary } from "./controllers/playAudio";
import Video from "./controllers/video";
import GeneratedSummaryFromWeb from "./controllers/generatedSummaryFromWeb";
import History from "./controllers/history";
import GenerateSummaryFromText from "./controllers/generateSummaryFromText";
import { Reward } from "./controllers/rewards";
import Summaries from "./controllers/allSummary";
import { Subscription } from "./controllers/subscription";
import { Payment } from "./controllers/payment";
import cookieParser from "cookie-parser";

// import Admin from "./controllers/admin";

export default class App {
  public static instance: express.Application;
  private static port: number;
  public static start(port: number) {
    this.instance = express();
    this.port = port;

    // Add middleware.
    this.initializeMiddleware();

    // Add controllers
    this.initializeControllers();
  }

  private static initializeMiddleware() {
    // logger
    firebase();
    // CORS
    this.instance.use(
      cors({
        origin: true,
        credentials: true,
        exposedHeaders: "x-auth-token",
      })
    );

    this.instance.use(cookieParser(process.env.COOKIE_SECRET));
    this.instance.use((req, res, next) => {
      const info =
        req.method +
        " " +
        req.url +
        " " +
        new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
      console.log("API HIT -------------->", info, "\n|\nv\n|\nv\n");
      next();
    });
    // enable http context

    // Body Parser
    this.instance.use(express.json({ limit: "50mb" })); // support json encoded bodies
  }

  private static initializeControllers() {
    // textToImage
    this.instance.use("/admin", new Admin().instance);
    this.instance.use("/auth", new Auth().router);
    this.instance.use("/image", validateAuthIdToken, new Image().router);
    this.instance.use("/feedback", validateAuthIdToken, new Feedback().router);
    this.instance.use("/user", new User().router);
    this.instance.use(
      "/inspiration",
      // validateAuthIdToken,
      new Inspiration().router
    );
    this.instance.use("/inApp", new InApp().router);
    this.instance.use("/reward", validateAuthIdToken, new Reward().router);

    this.instance.use("/audio", validateAuthIdToken, new Audio().router);
    this.instance.use("/pdf", validateAuthIdToken, new Pdf().router);
    this.instance.use(
      "/subscription",
      validateAuthIdToken,
      new Subscription().router
    );
    this.instance.use("/payment", validateAuthIdToken, new Payment().router);
    this.instance.use("/video", validateAuthIdToken, new Video().router);
    this.instance.use("/summary", validateAuthIdToken, new Summaries().router);
    this.instance.use("/generatedSummary", new GeneratedSummary().router);
    this.instance.use(
      "/generatedSummaryFromVideo",
      validateAuthIdToken,
      checkCreditLimit,
      new GenerateSummaryFromVideo().router
    );
    this.instance.use(
      "/generatedSummaryFromPDF",
      validateAuthIdToken,
      checkCreditLimit,
      new GenerateSummaryPdf().router
    );
    this.instance.use(
      "/generatedSummaryPDF", // Alias
      validateAuthIdToken,
      checkCreditLimit,
      new GenerateSummaryPdf().router
    );
    this.instance.use(
      "/generatedSummaryFromAudio",
      validateAuthIdToken,
      checkCreditLimit,
      new GenerateSummaryAudio().router
    );
    this.instance.use(
      "/generatedSummaryAudio", // Alias
      validateAuthIdToken,
      checkCreditLimit,
      new GenerateSummaryAudio().router
    );
    this.instance.use(
      "/generatedSummaryWeb",
      validateAuthIdToken,
      checkCreditLimit,
      new GeneratedSummaryFromWeb().router
    );
    this.instance.use(
      "/generateSummaryText",
      validateAuthIdToken,
      checkCreditLimit,
      new GenerateSummaryFromText().router
    );
    this.instance.use(
      "/translateSummary",
      validateAuthIdToken,
      checkCreditLimit,
      new Translate().router
    );
    this.instance.use(
      "/chatWithAi",
      validateAuthIdToken,
      checkCreditLimit,
      new ChatWithAI().router
    );
    this.instance.use(
      "/flashcard",
      validateAuthIdToken,
      checkCreditLimit,
      new FlashCard().router
    );
    this.instance.use(
      "/quiz",
      validateAuthIdToken,
      checkCreditLimit,
      new Quiz().router
    );
    this.instance.use(
      "/mindmap",
      validateAuthIdToken,
      checkCreditLimit,
      new MindMap().router
    );
    this.instance.use(
      "/audioSummary",

      new AudioSummary().router
    );
    this.instance.use("/history", new History().router);
    this.instance.use("/folders", new Folder().router);
    this.instance.use("/supportedLanguage", new SupportedLanguage().router);
  }
}
