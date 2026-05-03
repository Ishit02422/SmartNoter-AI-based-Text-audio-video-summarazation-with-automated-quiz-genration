import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import dotenv from "dotenv";

import path from "path";
dotenv.config({ path: path.join(__dirname, "../.env") });

export const getLlm = async () => {
  return new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    apiKey: process.env.GOOGLE_API_KEY,
    maxRetries: 2,
  });
};

