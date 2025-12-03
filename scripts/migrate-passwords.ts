/**
 * Migration Script: SHA256 → Bcrypt Password Hashing
 * 
 * Usage: npx ts-node scripts/migrate-passwords.ts
 * 
 * This script migrates all user passwords from SHA256 to bcrypt hashing.
 * - Sets all passwords to: password123
 * - Hashes with bcrypt (12 salt rounds)
 * - Updates all users in the database
 */

import bcryptjs from "bcryptjs";
import { MongoClient } from "mongodb";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load environment variables from .env.local
function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), ".env.local");
    const envContent = readFileSync(envPath, "utf-8");
    const env: Record<string, string> = {};

    envContent.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...valueParts] = trimmed.split("=");
        if (key) {
          env[key] = valueParts.join("=");
        }
      }
    });

    return env;
  } catch (error) {
    console.error("❌ Error: Could not load .env.local file");
    process.exit(1);
  }
}

const envVars = loadEnv();
const MONGODB_URI = envVars.MONGODB_URI;
const DATABASE_NAME = envVars.DATABASE_NAME;
const TEMP_PASSWORD = "password123";

if (!MONGODB_URI) {
  console.error("❌ Error: MONGODB_URI not found in .env.local");
  process.exit(1);
}

interface User {
  _id: any;
  username: string;
  password: string;
  email?: string;
  role?: string;
}

async function migratePasswords() {
  let client: MongoClient | null = null;

  try {
    // Connect to MongoDB
    console.log("🔗 Connecting to MongoDB...");
    client = new MongoClient(MONGODB_URI as string);
    await client.connect();
    console.log("✅ Connected to MongoDB");

    // Get database and collection
    const db = client.db(DATABASE_NAME);
    const usersCollection = db.collection<User>("users");

    // Get total count
    const totalUsers = await usersCollection.countDocuments();
    console.log(`\n📊 Total users in database: ${totalUsers}`);

    if (totalUsers === 0) {
      console.log("⚠️  No users found in database. Nothing to migrate.");
      return;
    }

    // Fetch all users
    console.log("\n📥 Fetching users from database...");
    const users = await usersCollection.find({}).toArray();
    console.log(`✅ Fetched ${users.length} users`);

    // Migrate each user
    console.log("\n🔄 Starting password migration...\n");

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < users.length; i++) {
      const user = users[i];

      try {
        // Hash new password with bcrypt
        const hashedPassword = await bcryptjs.hash(TEMP_PASSWORD, 12);

        // Update user in database
        const result = await usersCollection.updateOne(
          { _id: user._id },
          { $set: { password: hashedPassword } }
        );

        if (result.modifiedCount > 0) {
          console.log(
            `✅ [${i + 1}/${users.length}] ${user.username} - Password migrated to bcrypt`
          );
          successCount++;
        } else {
          console.log(
            `⚠️  [${i + 1}/${users.length}] ${user.username} - No changes made`
          );
        }
      } catch (error) {
        console.error(
          `❌ [${i + 1}/${users.length}] ${user.username} - Error: ${error instanceof Error ? error.message : String(error)}`
        );
        errorCount++;
      }
    }

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("📋 Migration Summary");
    console.log("=".repeat(60));
    console.log(`✅ Successfully migrated: ${successCount} users`);
    console.log(`❌ Failed migrations: ${errorCount} users`);
    console.log(`📝 Total users: ${totalUsers}`);
    console.log(`🔑 Temporary password: ${TEMP_PASSWORD}`);
    console.log("=".repeat(60));

    console.log("\n⚠️  Important Notes:");
    console.log("1. All user passwords have been set to: password123");
    console.log("2. Users MUST change their password on next login");
    console.log("3. Store this in your migration notes for user communication");

    if (errorCount === 0) {
      console.log("\n✅ Migration completed successfully!");
    } else {
      console.log(`\n⚠️  Migration completed with ${errorCount} error(s)`);
    }
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    // Close connection
    if (client) {
      await client.close();
      console.log("\n🔌 MongoDB connection closed");
    }
  }
}

// Run migration
migratePasswords().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
