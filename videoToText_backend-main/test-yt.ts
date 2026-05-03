import { BuildRAG } from "./src/controllers/rag/buildRag";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  try {
    const rag = new BuildRAG("youtube", { videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", language: "en" });
    const { docs, retrievalChain } = await rag.createChunksAndVectorStore();
    console.log("Docs created:", docs.length);
    const result = await retrievalChain.stream({
      input: "give me transcript and summary in en language from youtube video url given in context",
    });
    let resultString = "";
    for await (const chunk of result) {
      resultString += chunk?.answer || "";
    }
    console.log("Result:", resultString.substring(0, 100)); // only first 100 chars
  } catch (error: any) {
    console.error("ERROR CAUGHT:", error.message);
  }
}

main();
