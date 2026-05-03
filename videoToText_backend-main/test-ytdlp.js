const ytdl = require('yt-dlp-exec');

async function test() {
  try {
    console.log("Downloading audio...");
    await ytdl('https://www.youtube.com/watch?v=kBdlM6hNDAE', {
      extractAudio: true,
      audioFormat: 'mp3',
      output: 'test-audio.mp3',
    });
    console.log("Done");
  } catch (error) {
    console.error("Error:", error);
  }
}

test();
