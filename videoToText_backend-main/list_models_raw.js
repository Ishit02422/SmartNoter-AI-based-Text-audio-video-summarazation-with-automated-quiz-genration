const https = require('https');
const fs = require('fs');
const apiKey = "AIzaSyDFBnBkVMb0puuJLUeZfSA2NsPZkG8n1JE";

const req = https.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        fs.writeFileSync('available_models.json', data);
        console.log("Models list saved to available_models.json");
        process.exit(0);
    });
});

req.on("error", (err) => {
    fs.writeFileSync('available_models.json', JSON.stringify({ error: err.message }));
    process.exit(1);
});
