const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

async function listModels() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
        // There is no direct listModels in the SDK easily accessible without an auth client, 
        // but we can try to initialize one and see if it fails.
        // Actually, we can use the fetch API with the key.
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        console.log("AVAILABLE_MODELS_START");
        if (data.models) {
            data.models.forEach(m => console.log(m.name));
        } else {
            console.log("No models found or error:", JSON.stringify(data));
        }
        console.log("AVAILABLE_MODELS_END");
    } catch (e) {
        console.error("Error listing models:", e.message);
    }
}

listModels();
