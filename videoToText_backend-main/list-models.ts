import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "dotenv";
config();

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
    try {
        // Using common fetch/rest approach to list models since the node SDK doesn't have a direct listModels on the main class usually
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_API_KEY}`;
        const response = await fetch(url);
        const data: any = await response.json();

        if (data.models) {
            console.log("AVAILABLE MODELS:");
            data.models.forEach((m: any) => {
                console.log(`- ${m.name} (${m.supportedGenerationMethods.join(", ")})`);
            });
        } else {
            console.log("No models found or error:", data);
        }
    } catch (e: any) {
        console.log("Failed to list models:", e.message);
    }
}

listModels();
