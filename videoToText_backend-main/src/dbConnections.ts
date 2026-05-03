import mongoose from "mongoose";

export const connectDb = async () => {
  const dbUrl = process.env.DB_URL || "";

  if (!dbUrl) {
    throw new Error("❌ DB_URL is not set in .env file");
  }

  try {
    await mongoose.connect(dbUrl, {
      dbName: process.env.DB_NAME,
    });
    console.log(`✅ MongoDB Connected Successfully → ${dbUrl}${process.env.DB_NAME}`);
  } catch (error: any) {
    console.error("❌ MongoDB Connection Failed:", error.message);
    throw error;
  }
};
