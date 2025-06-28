import "dotenv/config";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import * as schema from "../shared/schema";
import fs from "fs/promises";
import path from "path";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to set up Postgres?");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function resetDatabase() {
  console.log("🔄 Starting database reset...");
  
  const db = drizzle(pool, { schema });

  try {
    // Drop all tables
    console.log("🗑️  Dropping all tables...");
    await pool.query(`
      DROP TABLE IF EXISTS 
        user_subscriptions,
        subscription_plans,
        recent_plays,
        user_favorites,
        affirmations,
        background_musics,
        playlists,
        categories,
        users
      CASCADE;
    `);

    // Create all tables manually
    console.log("📦 Creating tables...");
    
    // Create users table
    await pool.query(`
      CREATE TABLE "users" (
        "id" serial PRIMARY KEY NOT NULL,
        "username" text NOT NULL,
        "password" text NOT NULL,
        "name" text,
        "email" text,
        "avatar_url" text,
        "created_at" timestamp DEFAULT now(),
        CONSTRAINT "users_username_unique" UNIQUE("username")
      );
    `);

    // Create categories table
    await pool.query(`
      CREATE TABLE "categories" (
        "id" serial PRIMARY KEY NOT NULL,
        "name" text NOT NULL,
        "icon" text NOT NULL,
        "color" text NOT NULL
      );
    `);

    // Create playlists table
    await pool.query(`
      CREATE TABLE "playlists" (
        "id" serial PRIMARY KEY NOT NULL,
        "title" text NOT NULL,
        "description" text,
        "duration" integer NOT NULL,
        "affirmation_count" integer NOT NULL,
        "cover_gradient_start" text NOT NULL,
        "cover_gradient_end" text NOT NULL,
        "icon" text NOT NULL,
        "category_id" integer NOT NULL,
        "is_featured" boolean DEFAULT false,
        "created_at" timestamp DEFAULT now(),
        CONSTRAINT "playlists_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE
      );
    `);

    // Create affirmations table
    await pool.query(`
      CREATE TABLE "affirmations" (
        "id" serial PRIMARY KEY NOT NULL,
        "text" text NOT NULL,
        "audio_url" text NOT NULL,
        "duration" integer NOT NULL,
        "playlist_id" integer NOT NULL,
        CONSTRAINT "affirmations_playlist_id_playlists_id_fk" FOREIGN KEY ("playlist_id") REFERENCES "playlists"("id") ON DELETE CASCADE
      );
    `);

    // Create background_musics table
    await pool.query(`
      CREATE TABLE "background_musics" (
        "id" serial PRIMARY KEY NOT NULL,
        "name" text NOT NULL,
        "audio_url" text NOT NULL,
        "category" text NOT NULL
      );
    `);

    // Create user_favorites table
    await pool.query(`
      CREATE TABLE "user_favorites" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" integer NOT NULL,
        "playlist_id" integer NOT NULL,
        CONSTRAINT "user_favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "user_favorites_playlist_id_playlists_id_fk" FOREIGN KEY ("playlist_id") REFERENCES "playlists"("id") ON DELETE CASCADE
      );
    `);

    // Create recent_plays table
    await pool.query(`
      CREATE TABLE "recent_plays" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" integer NOT NULL,
        "playlist_id" integer NOT NULL,
        "played_at" timestamp DEFAULT now(),
        CONSTRAINT "recent_plays_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "recent_plays_playlist_id_playlists_id_fk" FOREIGN KEY ("playlist_id") REFERENCES "playlists"("id") ON DELETE CASCADE
      );
    `);

    // Create subscription_plans table
    await pool.query(`
      CREATE TABLE "subscription_plans" (
        "id" serial PRIMARY KEY NOT NULL,
        "name" text NOT NULL,
        "description" text,
        "price" decimal(10,2) NOT NULL,
        "duration" integer NOT NULL,
        "features" text[],
        "is_active" boolean DEFAULT true,
        "created_at" timestamp DEFAULT now()
      );
    `);

    // Create user_subscriptions table
    await pool.query(`
      CREATE TABLE "user_subscriptions" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" integer NOT NULL,
        "plan_id" integer NOT NULL,
        "status" text NOT NULL DEFAULT 'active',
        "start_date" timestamp NOT NULL,
        "end_date" timestamp NOT NULL,
        "created_at" timestamp DEFAULT now(),
        CONSTRAINT "user_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "user_subscriptions_plan_id_subscription_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "subscription_plans"("id") ON DELETE CASCADE
      );
    `);

    // Clear all audio files
    console.log("🎵 Clearing audio files...");
    const audioDirs = [
      path.join(process.cwd(), "public", "audio", "affirmations"),
      path.join(process.cwd(), "client", "public", "audio"),
      path.join(process.cwd(), "uploads", "background-music"),
      path.join(process.cwd(), "uploads", "audio")
    ];

    for (const dir of audioDirs) {
      try {
        const files = await fs.readdir(dir);
        for (const file of files) {
          if (file.endsWith('.mp3') || file.endsWith('.wav') || file.endsWith('.ogg') || file.endsWith('.m4a')) {
            await fs.unlink(path.join(dir, file));
            console.log(`🗑️  Deleted: ${file}`);
          }
        }
      } catch (error) {
        // Directory might not exist, that's okay
        console.log(`📁 Directory ${dir} not found or empty`);
      }
    }

    // Seed basic data
    console.log("🌱 Seeding basic data...");
    
    // Create admin user
    const adminUser = await db.insert(schema.users).values({
      username: "admin",
      password: "admin123", // In production, use proper hashing
      name: "Admin User",
      email: "admin@humsoul.com"
    }).returning();

    console.log("✅ Admin user created");

    // Create basic categories
    const categories = await db.insert(schema.categories).values([
      {
        name: "Confidence",
        icon: "target",
        color: "#FF6B6B"
      },
      {
        name: "Self-Love",
        icon: "heart",
        color: "#4ECDC4"
      },
      {
        name: "Motivation",
        icon: "zap",
        color: "#45B7D1"
      },
      {
        name: "Happiness",
        icon: "sun",
        color: "#96CEB4"
      },
      {
        name: "Health",
        icon: "leaf",
        color: "#FFEAA7"
      },
      {
        name: "Abundance",
        icon: "trending-up",
        color: "#DDA0DD"
      }
    ]).returning();

    console.log("✅ Categories created");

    // Create subscription plans
    const plans = await db.insert(schema.subscriptionPlans).values([
      {
        name: "Free Trial",
        description: "7-day free trial with limited access",
        price: "0.00",
        duration: 7,
        features: ["Access to basic affirmations", "Limited playlists", "Standard quality audio"],
        isActive: true
      },
      {
        name: "Premium Monthly",
        description: "Full access to all content",
        price: "9.99",
        duration: 30,
        features: ["Unlimited affirmations", "All playlists", "High quality audio", "Background music", "Offline downloads"],
        isActive: true
      },
      {
        name: "Premium Yearly",
        description: "Best value with annual billing",
        price: "99.99",
        duration: 365,
        features: ["Unlimited affirmations", "All playlists", "High quality audio", "Background music", "Offline downloads", "Priority support"],
        isActive: true
      }
    ]).returning();

    console.log("✅ Subscription plans created");

    console.log("🎉 Database reset completed successfully!");
    console.log("📝 Next steps:");
    console.log("   1. Upload your own music through the admin panel");
    console.log("   2. Create playlists and add affirmations");
    console.log("   3. Test the music player functionality");
    console.log("   4. Admin login: admin@humsoul.com / admin123");

  } catch (error) {
    console.error("❌ Error resetting database:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

resetDatabase().catch(console.error); 