const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/VideoToText').then(async () => {
  await mongoose.connection.collection('users').updateMany({}, { $set: { dailyCredits: 5 } });
  console.log('Credits set to 5!');
  process.exit(0);
});
