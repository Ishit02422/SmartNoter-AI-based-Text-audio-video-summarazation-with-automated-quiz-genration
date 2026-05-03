const https = require('https');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Try to load env manually since process.env might not be populated in a simple script run if not handled
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

const apiKey = process.env.GOOGLE_API_KEY;
console.log("Using API Key:", apiKey ? apiKey.substring(0, 5) + "..." : "MISSING");

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        try {
            const parsed = JSON.parse(data);
            if (parsed.models) {
                console.log("AVAILABLE MODELS:");
                parsed.models.forEach(m => {
                    console.log(`- ${m.name} (Methods: ${m.supportedGenerationMethods.join(', ')})`);
                });
            } else {
                console.log("No models found. Response:", JSON.stringify(parsed, null, 2));
            }
        } catch (e) {
            console.log("Error parsing JSON:", e.message);
            console.log("Raw Response:", data);
        }
    });
}).on('error', (err) => {
    console.log("Request Error:", err.message);
});
