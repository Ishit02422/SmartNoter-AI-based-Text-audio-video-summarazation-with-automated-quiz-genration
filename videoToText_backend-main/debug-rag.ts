import { BuildRAG } from "./src/controllers/rag/buildRag";
import { config } from "dotenv";
import path from "path";

config({ path: path.join(__dirname, ".env") });

async function test() {
    console.log("Starting Debug Test...");
    // A working TED-Ed link found by the subagent
    const videoUrl = "https://www.youtube.com/watch?v=gedoSfZvBgE";
    const payload = {
        videoUrl,
        language: "en",
        summary_types: "bullets"
    };

    const rag = new BuildRAG("youtube", payload);
    try {
        console.log("Calling loadDocsAndCreateChain...");
        const result = await (rag as any).loadDocsAndCreateChain();
        console.log("Docs loaded successfully. Number of docs:", result.docs.length);
        if (result.docs.length > 0) {
            console.log("Content length:", result.docs[0].pageContent.length);
            console.log("Content Preview:", result.docs[0].pageContent.substring(0, 200) + "...");
        }

        console.log("Calling createChunksAndVectorStore...");
        const vectorResult = await rag.createChunksAndVectorStore();
        console.log("Vector store created successfully.");

        console.log("Testing retrieval chain stream...");
        const stream = await vectorResult.retrivalChain.stream({
            input: "give me transcript and summary in en language from youtube video"
        });

        let output = "";
        for await (const chunk of stream) {
            output += chunk?.answer || "";
        }
        console.log("Stream completed. Output length:", output.length);
        console.log("Output Preview:", output.substring(0, 200) + "...");

    } catch (e: any) {
        console.error("DEBUG TEST FAILED!");
        console.error("Error Message:", e.message);
        console.error("Error Stack:", e.stack);
    }
}

test();
