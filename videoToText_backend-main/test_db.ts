import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/";
console.log('Testing connection to:', dbUrl);

mongoose.connect(dbUrl, {
    dbName: process.env.DB_NAME,
    serverSelectionTimeoutMS: 5000,
}).then(() => {
    console.log('SUCCESS: Connected to MongoDB');
    process.exit(0);
}).catch((err) => {
    console.error('FAILURE: Could not connect to MongoDB:', err.message);
    process.exit(1);
});
