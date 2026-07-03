const mongoose = require('mongoose');

const mongoUri = 'mongodb+srv://22bmiit022_db_user:SmartNoterPass123@cluster0.f9mupon.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function run() {
  try {
    console.log('Connecting to cloud MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('Connected successfully!');

    const adminDb = mongoose.connection.client.db().admin();
    const dbs = await adminDb.listDatabases();
    
    console.log('Available databases:');
    for (const dbInfo of dbs.databases) {
      const dbName = dbInfo.name;
      if (['admin', 'local', 'config'].includes(dbName)) continue;
      
      const db = mongoose.connection.client.db(dbName);
      const collections = await db.listCollections().toArray();
      const collectionNames = collections.map(c => c.name);
      
      if (collectionNames.includes('users')) {
        console.log(`Found 'users' collection in database: ${dbName}`);
        const result = await db.collection('users').updateMany({}, { $set: { dailyCredits: 8 } });
        console.log(`Successfully updated ${result.modifiedCount} users to 8 credits in database: ${dbName}.`);
      }
    }
  } catch (err) {
    console.error('Error occurred:', err.message || err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
