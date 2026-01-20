// backend/scripts/createAdmin.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../src/models/User.js'; // correct path

// Load .env from backend root
dotenv.config({ path: '../src/.env' });

async function run() {
  // MongoDB URI from env file (NO fallback)
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error("❌ MONGO_URI not found in .env");
    process.exit(1);
  }

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const email = "admin@example.com";
  const password = "admin123!"; // change immediately after first login

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.log("Admin already exists:", existing._id.toString());
    process.exit(0);
  }

  const hash = await bcrypt.hash(password, 10);

  const admin = new User({
    name: "KhatuPay Admin",
    email: email.toLowerCase(),
    mobile: "9999999998",
    passwordHash: hash,
    roles: ["admin"],
    emailVerified: true,
  });

  await admin.save();

  console.log("✅ Admin created successfully!");
  console.log("🆔 ID:", admin._id.toString());
  console.log("📧 Email:", email);
  console.log("🔑 Password:", password);

  process.exit(0);
}

run().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
