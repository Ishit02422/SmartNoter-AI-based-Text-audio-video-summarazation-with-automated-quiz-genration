const https = require('https');
const apiKey = "AIzaSyDFBnBkVMb0puuJLUeZfSA2NsPZkG8n1JE";

const models = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.0-pro",
    "gemini-2.0-flash-exp"
];

async function check(model) {
    return new Promise((resolve) => {
        const data = JSON.stringify({
            contents: [{ parts: [{ text: "hi" }] }]
        });
        const options = {
            hostname: 'generativelanguage.googleapis.com',
            path: `/v1beta/models/${model}:generateContent?key=${apiKey}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                console.log(`${model} (v1beta): ${res.statusCode}`);
                if (res.statusCode !== 200) console.log("  Err:", body.substring(0, 100));
                resolve(res.statusCode === 200);
            });
        });
        req.on('error', e => { console.log(`${model} error:`, e.message); resolve(false); });
        req.write(data);
        req.end();
    });
}

async function run() {
    for (const m of models) {
        await check(m);
    }
}

run();
