import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import dotenv from "dotenv";
import { StringOutputParser } from "@langchain/core/output_parsers";
dotenv.config();

async function test() {
  try {
    const llm = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash",
      apiKey: process.env.GOOGLE_API_KEY,
    });
    
    const res = await llm.invoke("What is 2+2?");
    console.log(res);
  } catch(e) {
    console.error("error:", e);
  }
}
test();
