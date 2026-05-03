const https = require('https');
const apiKey = "AIzaSyDFBnBkVMb0puuJLUeZfSA2NsPZkG8n1JE";

const req = https.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        try {
            const parsed = JSON.parse(data);
            if (parsed.models) {
                console.log("Found models:");
                parsed.models.forEach(m => console.log(m.name));
            } else {
                console.log("No models field in response:", parsed);
            }
        } catch (e) {
            console.log("Failed to parse response:", data);
        }
        process.exit(0);
    });
});

req.on("error", (err) => {
    console.log("Error: " + err.message);
    process.exit(1);
});

setTimeout(() => {
    console.log("Timeout reached");
    process.exit(1);
}, 10000);
