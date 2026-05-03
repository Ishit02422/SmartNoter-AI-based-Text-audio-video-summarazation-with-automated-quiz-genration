const https = require('https');

const keys = [
    "AIzaSyD2CK2Qft1WTFo8p2TbjQmAg86VN9eKXQo", // Current in .env
    "AIzaSyDFBnBkVMb0puuJLUeZfSA2NsPZkG8n1JE"  // Former key
];

async function checkKey(key) {
    return new Promise((resolve) => {
        https.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`, (res) => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => {
                console.log(`KEY: ${key.substring(0, 10)}... | STATUS: ${res.statusCode}`);
                if (res.statusCode === 200) {
                    const json = JSON.parse(d);
                    if (json.models) {
                        console.log(`  Found ${json.models.length} models.`);
                        console.log(`  Sample: ${json.models[0].name}`);
                    }
                } else {
                    console.log(`  Error: ${d.substring(0, 100)}`);
                }
                resolve();
            });
        }).on('error', e => {
            console.log(`KEY: ${key.substring(0, 10)}... | ERROR: ${e.message}`);
            resolve();
        });
    });
}

async function run() {
    for (const k of keys) {
        await checkKey(k);
    }
}

run();
