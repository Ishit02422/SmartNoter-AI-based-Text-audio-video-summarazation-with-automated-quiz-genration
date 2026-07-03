import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import dotenv from "dotenv";

import path from "path";
dotenv.config({ path: path.join(__dirname, "../.env") });

export const getLlm = async (keyIndex: number = 0) => {
  const keysStr = process.env.GOOGLE_API_KEY || "";
  const keys = keysStr.split(",").map((k) => k.trim()).filter(Boolean);
  const selectedKey = keys[keyIndex % keys.length] || "";

  return new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    apiKey: selectedKey,
    maxRetries: 2,
  });
};

