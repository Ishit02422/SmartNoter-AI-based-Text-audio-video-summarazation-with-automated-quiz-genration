const mongoose = require('mongoose');

const mongoUri = 'mongodb://127.0.0.1:27017/VideoToText'; 

async function checkUserCredits() {
    try {
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const users = await db.collection('users').find({}).toArray();
        
        console.log(`Found ${users.length} users`);
        users.forEach(u => {
            console.log(`User: ${u.firstName} ${u.lastName} (${u.email})`);
            console.log(`  dailyCredits: ${u.dailyCredits}`);
            console.log(`  glitter: ${u.glitter}`);
            console.log(`  credit: ${u.credit}`);
            console.log(`  rewardCount: ${u.rewardCount}`);
            console.log(`  isProUser: ${u.isProUser}`);
            console.log(`  isPurchased: ${u.isPurchased}`);
            console.log('---');
        });

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

checkUserCredits();
