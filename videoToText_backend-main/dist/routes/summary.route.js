"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const generative_ai_1 = require("@google/generative-ai");
const youtube_transcript_1 = require("youtube-transcript");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const router = (0, express_1.Router)();
router.post("/youtube/direct", async (req, res) => {
    try {
        const { videoUrl } = req.body;
        if (!videoUrl) {
            return res.status(400).json({ message: "Video URL required" });
        }
        // 🎥 Fetch transcript
        const transcriptArray = await youtube_transcript_1.YoutubeTranscript.fetchTranscript(videoUrl);
        const transcriptText = transcriptArray
            .map((item) => item.text)
            .join(" ");
        // 🤖 Gemini setup
        const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash"
        });
        const result = await model.generateContent({
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            text: `Summarize this YouTube transcript:\n\n${transcriptText}`
                        }
                    ]
                }
            ]
        });
        const summary = result.response.text();
        res.status(200).json({
            success: true,
            summary,
            transcript: transcriptText
        });
    }
    catch (error) {
        console.error("Error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});
exports.default = router;
//# sourceMappingURL=summary.route.js.map