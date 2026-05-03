
const axios = require('axios');
const fs = require('fs');

async function dump() {
    const videoId = "gedoSfZvBgE";
    console.log("Dumping page for", videoId);
    try {
        const res = await axios.get(`https://www.youtube.com/watch?v=${videoId}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
            }
        });
        fs.writeFileSync('youtube-dump.html', res.data);
        console.log("Dumped to youtube-dump.html");
    } catch (err) {
        console.error("Dump failed:", err.message);
    }
}

dump();
