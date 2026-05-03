
import { Innertube } from 'youtubei.js';

async function test() {
    try {
        const youtube = await Innertube.create();
        const videoId = "G2fbv8O694Y";
        console.log(`Testing youtubei.js for video: ${videoId}`);

        const info = await youtube.getInfo(videoId);
        const transcriptData = await info.getTranscript();

        if (!transcriptData) {
            console.log("No transcript data found with youtubei.js");
            return;
        }

        // Structure of transcriptData depends on version, but usually has segments
        console.log("Transcript fetched successfully!");
        console.log(JSON.stringify(transcriptData, null, 2).slice(0, 500) + "...");
    } catch (error: any) {
        console.error("youtubei.js failed:", error.message);
    }
}

test();
