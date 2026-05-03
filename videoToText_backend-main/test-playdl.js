const playdl = require("play-dl");
async function test() {
  try {
    const info = await playdl.video_info("https://www.youtube.com/watch?v=kBdlM6hNDAE");
    console.log(info.video_details.title);
  } catch(e) {
    console.log(e);
  }
}
test();
