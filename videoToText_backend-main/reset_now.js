const mongoose = require('mongoose');

const mongoUri = 'mongodb://22bmiit022_db_user:SmartNoterPass123@cluster0-shard-00-00.f9mupon.mongodb.net:27017,cluster0-shard-00-01.f9mupon.mongodb.net:27017,cluster0-shard-00-02.f9mupon.mongodb.net:27017/VideoToText?ssl=true&replicaSet=atlas-9x1vsz-shard-0&authSource=admin&retryWrites=true&w=majority';
const backupUri = 'mongodb+srv://22bmiit022_db_user:SmartNoterPass123@cluster0.f9mupon.mongodb.net/VideoToText?retryWrites=true&w=majority';

async function run() {
  try {
    console.log('Connecting to cloud MongoDB Atlas database...');
    // Try primary connection URI first
    try {
      await mongoose.connect(backupUri);
    } catch (e) {
      console.log('Retrying with backup connection string...');
      await mongoose.connect(mongoUri);
    }
    console.log('Connected successfully to cloud database!');

    const result = await mongoose.connection.collection('users').updateMany({}, { $set: { dailyCredits: 8 } });
    console.log(`Success! Updated ${result.modifiedCount} users to 8 credits in your cloud database.`);
  } catch (err) {
    console.error('Error connecting/updating database:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
