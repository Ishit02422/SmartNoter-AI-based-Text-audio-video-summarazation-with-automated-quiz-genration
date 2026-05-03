
import { BuildRAG } from './src/controllers/rag/buildRag';

async function testTranscript() {
    const videoId = "gedoSfZvBgE"; // Working one
    const rag = new BuildRAG("youtube", { videoUrl: `https://www.youtube.com/watch?v=${videoId}` });

    console.log(`Starting simple transcript test for: ${videoId}`);

    try {
        // Accessing the private method using any cast for debugging
        const docsResult = await (rag as any).loadDocsAndCreateChain();
        if (docsResult && docsResult.docs && docsResult.docs.length > 0) {
            console.log("Success! Transcript length:", docsResult.docs[0].pageContent.length);
            console.log("Preview:", docsResult.docs[0].pageContent.slice(0, 200));
        } else {
            console.log("Failed: No docs returned");
        }
    } catch (error: any) {
        console.error("Test failed with error:", error.message);
    }
}

testTranscript();
