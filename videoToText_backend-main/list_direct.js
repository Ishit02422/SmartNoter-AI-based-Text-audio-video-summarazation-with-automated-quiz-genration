const https = require('https');
const apiKey = "AIzaSyDFBnBkVMb0puuJLUeZfSA2NsPZkG8n1JE";

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        try {
            const parsed = JSON.parse(data);
            if (parsed.models) {
                console.log("SUCCESS_MODELS_LIST_START");
                parsed.models.forEach(m => console.log(m.name));
                console.log("SUCCESS_MODELS_LIST_END");
            } else {
                console.log("ERROR_RESPONSE:", data);
            }
        } catch (e) {
            console.log("PARSE_ERROR:", data);
        }
    });
}).on('error', (e) => console.log("FETCH_ERROR:", e.message));
