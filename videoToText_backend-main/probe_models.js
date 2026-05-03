const https = require('https');
const key = 'AIzaSyDFBnBkVMb0puuJLUeZfSA2NsPZkG8n1JE';

const modelsToTest = [
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-3.0-flash',
    'gemini-1.5-flash',
];

async function testModel(model) {
    return new Promise((resolve) => {
        const data = JSON.stringify({
            contents: [{ parts: [{ text: "hi" }] }]
        });
        const options = {
            hostname: 'generativelanguage.googleapis.com',
            path: `/v1beta/models/${model}:generateContent?key=${key}`,
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
                if (res.statusCode === 200) {
                    console.log(`WORKING: ${model} (v1beta)`);
                } else {
                    console.log(`FAILED: ${model} (v1beta) - Status: ${res.statusCode}`);
                }
                resolve();
            });
        });
        req.on('error', (e) => {
            console.log(`ERROR: ${model} - ${e.message}`);
            resolve();
        });
        req.write(data);
        req.end();
    });
}

async function run() {
    console.log("Starting model probe...");
    for (const model of modelsToTest) {
        await testModel(model);
    }
    console.log("Probe complete.");
}

run();
