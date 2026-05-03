const https = require('https');
const apiKey = "AIzaSyDFBnBkVMb0puuJLUeZfSA2NsPZkG8n1JE";

const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.0-pro", "gemini-2.0-flash-exp", "gemini-1.5-flash-latest"];

async function checkModels() {
    for (const model of models) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}?key=${apiKey}`;
        console.log(`Checking ${model}...`);
        await new Promise((resolve) => {
            https.get(url, (res) => {
                console.log(`  ${model}: ${res.statusCode}`);
                let data = '';
                res.on('data', d => data += d);
                res.on('end', () => {
                    if (res.statusCode !== 200) {
                        try {
                            const p = JSON.parse(data);
                            console.log(`  Error: ${p.error?.message}`);
                        } catch (e) { }
                    }
                    resolve();
                });
            }).on('error', (e) => {
                console.log(`  ${model} error: ${e.message}`);
                resolve();
            });
        });
    }
}

checkModels();
