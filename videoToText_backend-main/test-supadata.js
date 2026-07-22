const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');

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
  const apiKey = 'sd_ae2607e0ee29774d29b26753b844bb36';
  
  const proxies = await getIndianProxies();
  if (proxies.length === 0) return;

  // Try the first 5 proxies
  for (let i = 0; i < Math.min(10, proxies.length); i++) {
    const proxyUrl = proxies[i]; // e.g. "http://103.155.62.246:8080" or "socks5://..."
    console.log(`\nTrying proxy: ${proxyUrl}...`);
    
    try {
      let agent;
      if (proxyUrl.startsWith('socks')) {
        const { SocksProxyAgent } = require('socks-proxy-agent');
        agent = new SocksProxyAgent(proxyUrl);
      } else {
        agent = new HttpsProxyAgent(proxyUrl);
      }

      const res = await axios.get(
        `https://api.supadata.ai/v1/transcript?url=https://www.youtube.com/watch?v=${videoId}&text=true`,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey
          },
          httpAgent: agent,
          httpsAgent: agent,
          timeout: 10000
        }
      );
      console.log("Success with proxy:", proxyUrl);
      console.log("Result:", JSON.stringify(res.data, null, 2).slice(0, 300) + "...");
      return;
    } catch (error) {
      console.log(`Failed for proxy ${proxyUrl}:`, error.message);
    }
  }
}

test();
