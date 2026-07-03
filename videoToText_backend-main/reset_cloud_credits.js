const mongoose = require('mongoose');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Please enter your Cloud MongoDB Connection String (URI): ', async (mongoUri) => {
  if (!mongoUri) {
    console.log('Error: MongoDB URI cannot be empty!');
    rl.close();
    process.exit(1);
  }

  try {
    console.log('Connecting to cloud database...');
    await mongoose.connect(mongoUri.trim());
    console.log('Connected successfully!');

    const result = await mongoose.connection.collection('users').updateMany({}, { $set: { dailyCredits: 8 } });
    console.log(`Success! Updated ${result.modifiedCount} users to 8 credits.`);
  } catch (err) {
    console.error('Error connecting/updating database:', err.message);
  } finally {
    await mongoose.disconnect();
    rl.close();
    process.exit(0);
  }
});
