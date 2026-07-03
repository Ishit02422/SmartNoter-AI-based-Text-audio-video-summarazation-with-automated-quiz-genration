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

        const keysStr = process.env.GOOGLE_API_KEY || "";
        const keys = keysStr.split(",").map(k => k.trim()).filter(Boolean);
        
        let summary = "";
        let errorToThrow: any = null;
        for (let i = 0; i < keys.length; i++) {
            try {
                // 🤖 Gemini setup
                const genAI = new GoogleGenerativeAI(keys[i]);
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
                summary = result.response.text();
                break;
            } catch (err: any) {
                console.error(`Gemini summary route error with key index ${i}:`, err.message);
                errorToThrow = err;
            }
        }

        if (!summary && errorToThrow) {
            throw errorToThrow;
        }

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