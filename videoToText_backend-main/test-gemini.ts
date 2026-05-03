import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { config } from "dotenv";
import path from "path";

// Correctly point to the .env file in the current directory
config({ path: path.join(__dirname, ".env") });

async function testGemini() {
    const apiKey = process.env.GOOGLE_API_KEY;
    console.log("Using API Key:", apiKey ? "PRESENT" : "MISSING");

    if (!apiKey) {
        console.error("ERROR: GOOGLE_API_KEY is not defined in .env file.");
        return;
    }

    try {
        console.log("Testing Chat Model...");
        const llm = new ChatGoogleGenerativeAI({
            apiKey: apiKey,
            model: "gemini-2.0-flash",
        });

        const res = await llm.invoke("Hello, are you working?");
        console.log("Chat Response:", res.content);

        console.log("Testing Embeddings...");
        const embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: apiKey,
        });
        const embedRes = await embeddings.embedQuery("Hello world");
        console.log("Embeddings generated, length:", embedRes.length);

        console.log("SUCCESS: Gemini API is working correctly!");
    } catch (error: any) {
        console.error("Gemini API Test Failed:", error.message || error);
    }
}

testGemini();
