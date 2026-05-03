const https = require('https');
const apiKey = "AIzaSyDFBnBkVMb0puuJLUeZfSA2NsPZkG8n1JE";

const options = {
    hostname: 'generativelanguage.googleapis.com',
    path: `/v1beta/models?key=${apiKey}`,
    method: 'GET'
};

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (d) => {
        data += d;
    });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.models) {
                console.log("START_MODELS");
                json.models.forEach(m => console.log(m.name));
                console.log("END_MODELS");
            } else {
                console.log("ERROR:", data);
            }
        } catch (e) {
            console.log("PARSE_ERROR:", data);
        }
    });
});

req.on('error', (e) => {
    console.error(e);
});
req.end();
