const ytdl = require("@distube/ytdl-core");

async function test() {
  try {
    const info = await ytdl.getInfo("https://www.youtube.com/watch?v=kBdlM6hNDAE");
    console.log(info.videoDetails.title);
    const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
    console.log("Audio formats length:", audioFormats.length);
  } catch(e) {
    console.log("Error:", e.message);
  }
}

test();
