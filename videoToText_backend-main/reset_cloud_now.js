const mongoose = require('mongoose');

const cloudUri = 'mongodb+srv://ishitsathe02:ishitsathe02@smartnoter.43fxx.mongodb.net/test?retryWrites=true&w=majority&appName=Smartnoter';
const cloudUriWithoutDB = 'mongodb+srv://ishitsathe02:ishitsathe02@smartnoter.43fxx.mongodb.net/?retryWrites=true&w=majority&appName=Smartnoter';

async function run() {
  try {
    console.log('Connecting to cloud MongoDB Atlas (Smartnoter)...');
    await mongoose.connect(cloudUriWithoutDB);
    console.log('Connected successfully!');

    // Let's find out which database contains the 'users' collection
    const adminDb = mongoose.connection.client.db().admin();
    const dbs = await adminDb.listDatabases();
    
    console.log('Available databases:');
    for (const dbInfo of dbs.databases) {
      const dbName = dbInfo.name;
      // Skip system databases
      if (['admin', 'local', 'config'].includes(dbName)) continue;
      
      const db = mongoose.connection.client.db(dbName);
      const collections = await db.listCollections().toArray();
      const collectionNames = collections.map(c => c.name);
      
      if (collectionNames.includes('users')) {
        console.log(`Found 'users' collection in database: ${dbName}`);
        const result = await db.collection('users').updateMany({}, { $set: { dailyCredits: 8 } });
        console.log(`Successfully updated ${result.modifiedCount} users to 8 credits in database: ${dbName}`);
      }
    }
  } catch (err) {
    console.error('Error occurred:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
