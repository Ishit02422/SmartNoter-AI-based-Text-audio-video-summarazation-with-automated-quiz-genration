const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    try {
        const result = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }).listModels();
        // Wait, listModels is on the genAI object usually, or via a special client.
        // Actually the easiest way is the REST API which the user's script tried.
    } catch (e) {
        console.log(e.message);
    }
}
// Let's just use the REST API correctly in a script.
const https = require('https');
const apiKey = process.env.GOOGLE_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        console.log(data);
    });
}).on('error', (e) => console.log(e.message));
