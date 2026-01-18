import mongoose from 'mongoose';

export async function connectDB() {
  try {
    // Get Mongo URI from .env
    const uri = process.env.MONGO_URI;

    if (!uri) {
      throw new Error("❌ MONGO_URI not found in .env file");
    }

    mongoose.set("strictQuery", true);

    await mongoose.connect(uri, {
      autoIndex: true,
    });

    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error.message);
    // Do not exit, allow app to start for deployment
  }
}
