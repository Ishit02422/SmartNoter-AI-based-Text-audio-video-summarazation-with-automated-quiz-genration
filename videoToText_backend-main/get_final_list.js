const https = require('https');
const fs = require('fs');
const apiKey = "AIzaSyDFBnBkVMb0puuJLUeZfSA2NsPZkG8n1JE";

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        fs.writeFileSync('FINAL_MODELS_LIST.json', data);
        console.log('DONE: Written to FINAL_MODELS_LIST.json');
    });
}).on('error', (e) => {
    fs.writeFileSync('FINAL_MODELS_LIST.json', JSON.stringify({ error: e.message }));
});
