"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const admin_1 = __importDefault(require("./controllers/admin"));
const auth_1 = __importDefault(require("./controllers/auth"));
const feedback_1 = __importDefault(require("./controllers/feedback"));
const image_1 = __importDefault(require("./controllers/image"));
const inApp_1 = __importDefault(require("./controllers/inApp"));
const inspiration_1 = __importDefault(require("./controllers/inspiration"));
const user_1 = __importDefault(require("./controllers/user"));
const generatedSummary_1 = __importDefault(require("./controllers/generatedSummary"));
const supportedLanguage_1 = __importDefault(require("./controllers/supportedLanguage"));
const audio_1 = __importDefault(require("./controllers/audio"));
const firebase_1 = require("./helper/firebase");
const validateAuthIdToken_1 = require("./middleware/validateAuthIdToken");
const checkCreditLimit_1 = require("./middleware/checkCreditLimit");
const generateSummaryFromYoutube_1 = __importDefault(require("./controllers/generateSummaryFromYoutube"));
const generateSummaryAudio_1 = __importDefault(require("./controllers/generateSummaryAudio"));
const generatedSummaryPDF_1 = __importDefault(require("./controllers/generatedSummaryPDF"));
const pdf_1 = require("./controllers/pdf");
const folders_1 = __importDefault(require("./controllers/folders"));
const translate_1 = require("./controllers/translate");
const chatWithAI_1 = __importDefault(require("./controllers/chatWithAI"));
const flashcard_1 = require("./controllers/flashcard");
const quiz_1 = require("./controllers/quiz");
const mindMap_1 = require("./controllers/mindMap");
const playAudio_1 = require("./controllers/playAudio");
const video_1 = __importDefault(require("./controllers/video"));
const generatedSummaryFromWeb_1 = __importDefault(require("./controllers/generatedSummaryFromWeb"));
const history_1 = __importDefault(require("./controllers/history"));
const generateSummaryFromText_1 = __importDefault(require("./controllers/generateSummaryFromText"));
const rewards_1 = require("./controllers/rewards");
const allSummary_1 = __importDefault(require("./controllers/allSummary"));
const subscription_1 = require("./controllers/subscription");
const payment_1 = require("./controllers/payment");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
// import Admin from "./controllers/admin";
class App {
    static start(port) {
        this.instance = (0, express_1.default)();
        this.port = port;
        // Add middleware.
        this.initializeMiddleware();
        // Add controllers
        this.initializeControllers();
    }
    static initializeMiddleware() {
        // logger
        (0, firebase_1.firebase)();
        // CORS
        this.instance.use((0, cors_1.default)({
            origin: true,
            credentials: true,
            exposedHeaders: "x-auth-token",
        }));
        this.instance.use((0, cookie_parser_1.default)(process.env.COOKIE_SECRET));
        this.instance.use((req, res, next) => {
            const info = req.method +
                " " +
                req.url +
                " " +
                new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
            console.log("API HIT -------------->", info, "\n|\nv\n|\nv\n");
            next();
        });
        // enable http context
        // Body Parser
        this.instance.use(express_1.default.json({ limit: "50mb" })); // support json encoded bodies
    }
    static initializeControllers() {
        // textToImage
        this.instance.use("/admin", new admin_1.default().instance);
        this.instance.use("/auth", new auth_1.default().router);
        this.instance.use("/image", validateAuthIdToken_1.validateAuthIdToken, new image_1.default().router);
        this.instance.use("/feedback", validateAuthIdToken_1.validateAuthIdToken, new feedback_1.default().router);
        this.instance.use("/user", new user_1.default().router);
        this.instance.use("/inspiration", 
        // validateAuthIdToken,
        new inspiration_1.default().router);
        this.instance.use("/inApp", new inApp_1.default().router);
        this.instance.use("/reward", validateAuthIdToken_1.validateAuthIdToken, new rewards_1.Reward().router);
        this.instance.use("/audio", validateAuthIdToken_1.validateAuthIdToken, new audio_1.default().router);
        this.instance.use("/pdf", validateAuthIdToken_1.validateAuthIdToken, new pdf_1.Pdf().router);
        this.instance.use("/subscription", validateAuthIdToken_1.validateAuthIdToken, new subscription_1.Subscription().router);
        this.instance.use("/payment", validateAuthIdToken_1.validateAuthIdToken, new payment_1.Payment().router);
        this.instance.use("/video", validateAuthIdToken_1.validateAuthIdToken, new video_1.default().router);
        this.instance.use("/summary", validateAuthIdToken_1.validateAuthIdToken, new allSummary_1.default().router);
        this.instance.use("/generatedSummary", new generatedSummary_1.default().router);
        this.instance.use("/generatedSummaryFromVideo", validateAuthIdToken_1.validateAuthIdToken, checkCreditLimit_1.checkCreditLimit, new generateSummaryFromYoutube_1.default().router);
        this.instance.use("/generatedSummaryFromPDF", validateAuthIdToken_1.validateAuthIdToken, checkCreditLimit_1.checkCreditLimit, new generatedSummaryPDF_1.default().router);
        this.instance.use("/generatedSummaryPDF", // Alias
        validateAuthIdToken_1.validateAuthIdToken, checkCreditLimit_1.checkCreditLimit, new generatedSummaryPDF_1.default().router);
        this.instance.use("/generatedSummaryFromAudio", validateAuthIdToken_1.validateAuthIdToken, checkCreditLimit_1.checkCreditLimit, new generateSummaryAudio_1.default().router);
        this.instance.use("/generatedSummaryAudio", // Alias
        validateAuthIdToken_1.validateAuthIdToken, checkCreditLimit_1.checkCreditLimit, new generateSummaryAudio_1.default().router);
        this.instance.use("/generatedSummaryWeb", validateAuthIdToken_1.validateAuthIdToken, checkCreditLimit_1.checkCreditLimit, new generatedSummaryFromWeb_1.default().router);
        this.instance.use("/generateSummaryText", validateAuthIdToken_1.validateAuthIdToken, checkCreditLimit_1.checkCreditLimit, new generateSummaryFromText_1.default().router);
        this.instance.use("/translateSummary", validateAuthIdToken_1.validateAuthIdToken, checkCreditLimit_1.checkCreditLimit, new translate_1.Translate().router);
        this.instance.use("/chatWithAi", validateAuthIdToken_1.validateAuthIdToken, checkCreditLimit_1.checkCreditLimit, new chatWithAI_1.default().router);
        this.instance.use("/flashcard", validateAuthIdToken_1.validateAuthIdToken, checkCreditLimit_1.checkCreditLimit, new flashcard_1.FlashCard().router);
        this.instance.use("/quiz", validateAuthIdToken_1.validateAuthIdToken, checkCreditLimit_1.checkCreditLimit, new quiz_1.Quiz().router);
        this.instance.use("/mindmap", validateAuthIdToken_1.validateAuthIdToken, checkCreditLimit_1.checkCreditLimit, new mindMap_1.MindMap().router);
        this.instance.use("/audioSummary", new playAudio_1.AudioSummary().router);
        this.instance.use("/history", new history_1.default().router);
        this.instance.use("/folders", new folders_1.default().router);
        this.instance.use("/supportedLanguage", new supportedLanguage_1.default().router);
    }
}
exports.default = App;
//# sourceMappingURL=app.js.map