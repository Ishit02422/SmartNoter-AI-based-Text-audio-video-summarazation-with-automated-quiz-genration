const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');
const { YoutubeTranscript } = require('youtube-transcript');

async function getIndianProxies() {
  try {
    const res = await axios.get('https://api.proxyscrape.com/v4/free-proxy-list/get?request=display_proxies&proxy_format=protocolipport&format=text&country=in', { timeout: 10000 });
    const list = res.data.trim().split('\n').map(p => p.trim()).filter(Boolean);
    console.log(`Fetched ${list.length} Indian proxies.`);
    return list;
  } catch (error) {
    console.error("Failed to fetch proxies:", error.message);
    return [];
  }
}

async function test() {
  const videoId = 'kqYKmO74Fs8';
  const proxies = await getIndianProxies();
  if (proxies.length === 0) return;

  for (let i = 0; i < Math.min(15, proxies.length); i++) {
    const proxyUrl = proxies[i];
    console.log(`\nTrying proxy: ${proxyUrl}...`);
    try {
      const agent = new HttpsProxyAgent(proxyUrl);
      
      // Let's test standard axios request to a YouTube endpoint through the proxy
      const res = await axios.get(
        `https://www.youtube.com/watch?v=${videoId}`,
        {
          httpAgent: agent,
          httpsAgent: agent,
          timeout: 8000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        }
      );

      console.log(`Successfully fetched YouTube page using proxy ${proxyUrl}! Status:`, res.status);
      if (res.data.includes('yt-player-config') || res.data.includes('playabilityStatus')) {
        console.log("Looks like a valid YouTube page!");
        
        // Let's try youtube-transcript fetch with this agent if we can pass it, or just direct caption scrape
        return;
      }
    } catch (e) {
      console.log(`Failed for proxy ${proxyUrl}:`, e.message);
    }
  }
}

test();
