
import { BuildRAG } from './src/controllers/rag/buildRag';

async function testAll() {
    const videoId = "gedoSfZvBgE"; // TED-Ed video
    const rag = new BuildRAG("youtube", { videoUrl: `https://www.youtube.com/watch?v=${videoId}` });

    console.log(`--- Testing ALL Transcript Methods for: ${videoId} ---`);

    try {
        await (rag as any).loadDocsAndCreateChain();
        console.log("SUCCESS overall!");
    } catch (error: any) {
        console.error("OVERALL FAILURE:", error.message);
    }
}

testAll();
