import dotenv from "dotenv";
dotenv.config();
import axios from "axios";
import { BuildRAG } from "./src/controllers/rag/buildRag";

async function testSpeed() {
  console.log("Starting speed and functionality check for video hlGoQC332VM...");
  const rag = new BuildRAG("youtube", { videoUrl: "https://www.youtube.com/watch?v=hlGoQC332VM", language: "en" });
  
  const start = Date.now();
  try {
    // Access the private getTranscript method via any cast
    const transcript = await (rag as any).getTranscript("https://www.youtube.com/watch?v=hlGoQC332VM");
    console.log(`\nSUCCESS: Got transcript of length ${transcript.length} in ${(Date.now() - start) / 1000}s`);
  } catch (err: any) {
    console.error(`\nFAILED after ${(Date.now() - start) / 1000}s with error:`, err.message);
  }
}

testSpeed();
