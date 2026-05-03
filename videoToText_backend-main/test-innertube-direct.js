
const { Innertube } = require('youtubei.js');
const fs = require('fs');

async function test() {
    const videoId = "gedoSfZvBgE";
    console.log("Starting Innertube test for", videoId);
    try {
        const yt = await Innertube.create();
        const info = await yt.getInfo(videoId);
        const transcript = await info.getTranscript();
        const text = transcript.content.body.initial_segments.map(s => s.snippet.text).join(' ');
        fs.writeFileSync('transcript-result.txt', text);
        console.log("SUCCESS! Saved to transcript-result.txt");
    } catch (err) {
        fs.writeFileSync('transcript-error.txt', err.stack || err.message);
        console.error("FAILURE:", err.message);
    }
}

test();
