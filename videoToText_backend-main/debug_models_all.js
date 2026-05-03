const https = require('https');
const apiKey = "AIzaSyDFBnBkVMb0puuJLUeZfSA2NsPZkG8n1JE";

async function get(url) {
    return new Promise((resolve) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, data }));
        }).on('error', e => resolve({ status: 500, data: e.message }));
    });
}

async function run() {
    console.log("--- CHECKING v1beta ---");
    const resBeta = await get(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    console.log("Status:", resBeta.status);
    try {
        const json = JSON.parse(resBeta.data);
        if (json.models) {
            json.models.forEach(m => console.log(`- ${m.name} (${m.supportedGenerationMethods.join(',')})`));
        } else {
            console.log("Error or No Models:", resBeta.data);
        }
    } catch (e) {
        console.log("Parse Error:", resBeta.data);
    }

    console.log("\n--- CHECKING v1 ---");
    const resV1 = await get(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
    console.log("Status:", resV1.status);
    try {
        const json = JSON.parse(resV1.data);
        if (json.models) {
            json.models.forEach(m => console.log(`- ${m.name}`));
        } else {
            console.log("Error or No Models:", resV1.data);
        }
    } catch (e) {
        console.log("Parse Error:", resV1.data);
    }
}

run();
