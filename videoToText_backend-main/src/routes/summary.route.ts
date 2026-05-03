import { Router } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { YoutubeTranscript } from "youtube-transcript";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

router.post("/youtube/direct", async (req, res) => {
    try {
        const { videoUrl } = req.body;

        if (!videoUrl) {
            return res.status(400).json({ message: "Video URL required" });
        }

        // 🎥 Fetch transcript
        const transcriptArray = await YoutubeTranscript.fetchTranscript(videoUrl);

        const transcriptText = transcriptArray
            .map((item) => item.text)
            .join(" ");

        // 🤖 Gemini setup
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

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

    } catch (error: any) {
        console.error("Error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router;