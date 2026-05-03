const mongoose = require('mongoose');

const mongoUri = 'mongodb://127.0.0.1:27017/VideoToText'; 

async function checkUserCredits() {
    try {
        await mongoose.connect(mongoUri);
        const db = mongoose.connection.db;
        const users = await db.collection('users').find({}).toArray();
        
        users.forEach(u => {
            console.log(`USER_DATA: ${u.email} | dailyCredits: ${u.dailyCredits} | glitter: ${u.glitter} | credit: ${u.credit}`);
        });

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

checkUserCredits();
