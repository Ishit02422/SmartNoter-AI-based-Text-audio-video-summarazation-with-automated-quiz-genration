const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/VideoToText').then(async () => {
  await mongoose.connection.collection('users').updateMany({}, { $set: { dailyCredits: 8 } });
  console.log('Credits set to 8!');
  process.exit(0);
});
