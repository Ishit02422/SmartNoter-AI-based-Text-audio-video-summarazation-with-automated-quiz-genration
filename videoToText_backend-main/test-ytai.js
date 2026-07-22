const axios = require('axios');

async function test() {
  const videoId = 'yvkG_G6dK0w'; // Global video
  const videoId2 = 'kqYKmO74Fs8'; // India-only video
  
  try {
    const res = await axios.get(`https://youtube-transcript.ai/transcript/${videoId}.txt`, { timeout: 10000 });
    console.log("Success global:", res.data.slice(0, 200));
  } catch (error) {
    console.log("Failed global:", error.message);
  }

  try {
    const res = await axios.get(`https://youtube-transcript.ai/transcript/${videoId2}.txt`, { timeout: 10000 });
    console.log("Success India-only:", res.data.slice(0, 200));
  } catch (error) {
    console.log("Failed India-only:", error.message);
  }
}

test();
