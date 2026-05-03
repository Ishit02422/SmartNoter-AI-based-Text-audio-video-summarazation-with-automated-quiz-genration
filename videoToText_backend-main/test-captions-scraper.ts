
import { getSubtitles } from 'youtube-captions-scraper';

async function test() {
    const videoId = "G2fbv8O694Y";
    console.log(`Testing youtube-captions-scraper for video: ${videoId}`);

    try {
        const captions = await getSubtitles({
            videoID: videoId,
            lang: 'en'
        });

        console.log("Captions fetched successfully!");
        console.log(JSON.stringify(captions, null, 2).slice(0, 500) + "...");
    } catch (error: any) {
        console.error("youtube-captions-scraper failed:", error.message);
    }
}

test();
