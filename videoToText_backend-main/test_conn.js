const mongoose = require('mongoose');

const uri = 'mongodb+srv://22bmiit022_db_user:SmartNoterPass123@cluster0.f9mupon.mongodb.net/VideoToText?retryWrites=true&w=majority';

async function run() {
  try {
    console.log('Connecting...');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('Connected successfully!');
    const result = await mongoose.connection.collection('users').updateMany({}, { $set: { dailyCredits: 8 } });
    console.log('Result:', result);
  } catch (err) {
    console.error('Connection failed with error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
