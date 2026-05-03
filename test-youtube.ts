import { BuildRAG } from "./videoToText_backend-main/src/controllers/rag/buildRag";
import dotenv from "dotenv";

dotenv.config({ path: "./videoToText_backend-main/.env" });

async function main() {
  try {
    const rag = new BuildRAG("youtube", { videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" });
    const { docs, retrievalChain } = await rag.createChunksAndVectorStore();
    console.log("Docs:", docs.length);
    const result = await retrievalChain.stream({
      input: `give me transcript and summary in English language from youtube video url given in context`,
    });
    let resultString = "";
    for await (const chunk of result) {
      resultString += chunk?.answer || "";
    }
    console.log("Result:", resultString);
  } catch (error) {
    console.error("ERROR:", error);
  }
}

main();
