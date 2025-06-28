import { db } from "../server/db";
import { 
  users, 
  categories, 
  playlists, 
  affirmations, 
  backgroundMusics, 
  userFavorites, 
  recentPlays,
  subscriptionPlans,
  userSubscriptions
} from "../shared/schema";

async function resetDatabase() {
  console.log("🗑️  Starting complete database reset...");

  try {
    // Drop all tables in the correct order (respecting foreign key constraints)
    console.log("Dropping all tables...");
    
    // First drop tables that depend on others
    await db.execute(`DROP TABLE IF EXISTS user_subscriptions CASCADE`);
    await db.execute(`DROP TABLE IF EXISTS subscription_plans CASCADE`);
    await db.execute(`DROP TABLE IF EXISTS recent_plays CASCADE`);
    await db.execute(`DROP TABLE IF EXISTS user_favorites CASCADE`);
    await db.execute(`DROP TABLE IF EXISTS affirmations CASCADE`);
    await db.execute(`DROP TABLE IF EXISTS playlists CASCADE`);
    await db.execute(`DROP TABLE IF EXISTS categories CASCADE`);
    await db.execute(`DROP TABLE IF EXISTS background_musics CASCADE`);
    await db.execute(`DROP TABLE IF EXISTS users CASCADE`);
    
    console.log("✓ All tables dropped");

    // Recreate tables using Drizzle migrations
    console.log("Recreating tables...");
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id serial PRIMARY KEY NOT NULL,
        username text NOT NULL UNIQUE,
        password text NOT NULL,
        name text,
        email text,
        avatar_url text,
        created_at timestamp DEFAULT now()
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id serial PRIMARY KEY NOT NULL,
        name text NOT NULL,
        icon text NOT NULL,
        color text NOT NULL
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS playlists (
        id serial PRIMARY KEY NOT NULL,
        title text NOT NULL,
        description text,
        duration integer NOT NULL,
        affirmation_count integer NOT NULL,
        cover_gradient_start text NOT NULL,
        cover_gradient_end text NOT NULL,
        icon text NOT NULL,
        category_id integer NOT NULL,
        is_featured boolean DEFAULT false,
        created_at timestamp DEFAULT now()
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS affirmations (
        id serial PRIMARY KEY NOT NULL,
        text text NOT NULL,
        audio_url text NOT NULL,
        duration integer NOT NULL,
        playlist_id integer NOT NULL
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS background_musics (
        id serial PRIMARY KEY NOT NULL,
        name text NOT NULL,
        audio_url text NOT NULL,
        category text NOT NULL
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS user_favorites (
        id serial PRIMARY KEY NOT NULL,
        user_id integer NOT NULL,
        playlist_id integer NOT NULL
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS recent_plays (
        id serial PRIMARY KEY NOT NULL,
        user_id integer NOT NULL,
        playlist_id integer NOT NULL,
        played_at timestamp DEFAULT now()
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS subscription_plans (
        id serial PRIMARY KEY NOT NULL,
        name text NOT NULL,
        description text,
        price numeric(10, 2) NOT NULL,
        duration integer NOT NULL,
        features text[],
        is_active boolean DEFAULT true,
        created_at timestamp DEFAULT now()
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS user_subscriptions (
        id serial PRIMARY KEY NOT NULL,
        user_id integer NOT NULL,
        plan_id integer NOT NULL,
        status text DEFAULT 'active' NOT NULL,
        start_date timestamp NOT NULL,
        end_date timestamp NOT NULL,
        created_at timestamp DEFAULT now()
      );
    `);

    // Add foreign key constraints
    await db.execute(`
      ALTER TABLE playlists 
      ADD CONSTRAINT playlists_category_id_categories_id_fk 
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE;
    `);

    await db.execute(`
      ALTER TABLE affirmations 
      ADD CONSTRAINT affirmations_playlist_id_playlists_id_fk 
      FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE;
    `);

    await db.execute(`
      ALTER TABLE user_favorites 
      ADD CONSTRAINT user_favorites_user_id_users_id_fk 
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    `);

    await db.execute(`
      ALTER TABLE user_favorites 
      ADD CONSTRAINT user_favorites_playlist_id_playlists_id_fk 
      FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE;
    `);

    await db.execute(`
      ALTER TABLE recent_plays 
      ADD CONSTRAINT recent_plays_user_id_users_id_fk 
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    `);

    await db.execute(`
      ALTER TABLE recent_plays 
      ADD CONSTRAINT recent_plays_playlist_id_playlists_id_fk 
      FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE;
    `);

    await db.execute(`
      ALTER TABLE user_subscriptions 
      ADD CONSTRAINT user_subscriptions_user_id_users_id_fk 
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    `);

    await db.execute(`
      ALTER TABLE user_subscriptions 
      ADD CONSTRAINT user_subscriptions_plan_id_subscription_plans_id_fk 
      FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE CASCADE;
    `);

    console.log("✓ All tables recreated with constraints");

    // Seed the database with fresh data
    console.log("🌱 Seeding database with fresh data...");
    
    // Add categories
    console.log("Adding categories...");
    const [confidence, selfLove, abundance, happiness, health, motivation] = await db.insert(categories).values([
      { name: "Confidence", icon: "✨", color: "#8B5CF6" },
      { name: "Self Love", icon: "❤️", color: "#EC4899" },
      { name: "Abundance", icon: "💫", color: "#F59E0B" },
      { name: "Happiness", icon: "😊", color: "#10B981" },
      { name: "Health", icon: "🌿", color: "#3B82F6" },
      { name: "Motivation", icon: "🔥", color: "#EF4444" }
    ]).returning();

    // Add playlists
    console.log("Adding playlists...");
    const [confidencePlaylist, selfLovePlaylist] = await db.insert(playlists).values([
      {
        title: "Daily Confidence Boost",
        description: "Start your day with powerful confidence affirmations",
        duration: 600, // 10 minutes
        affirmationCount: 10,
        coverGradientStart: "#8B5CF6",
        coverGradientEnd: "#6366F1",
        icon: "✨",
        categoryId: confidence.id,
        isFeatured: true
      },
      {
        title: "Self Love Journey",
        description: "Nurture your relationship with yourself",
        duration: 900, // 15 minutes
        affirmationCount: 12,
        coverGradientStart: "#EC4899",
        coverGradientEnd: "#F472B6",
        icon: "❤️",
        categoryId: selfLove.id,
        isFeatured: true
      }
    ]).returning();

    // Add affirmations
    console.log("Adding affirmations...");
    await db.insert(affirmations).values([
      // Confidence affirmations
      {
        text: "I am confident and capable in everything I do",
        audioUrl: "/audio/affirmations/confidence-1.mp3",
        duration: 60,
        playlistId: confidencePlaylist.id
      },
      {
        text: "I trust in my abilities and inner wisdom",
        audioUrl: "/audio/affirmations/confidence-2.mp3",
        duration: 60,
        playlistId: confidencePlaylist.id
      },
      {
        text: "I radiate confidence, self-respect, and inner harmony",
        audioUrl: "/audio/affirmations/confidence-3.mp3",
        duration: 60,
        playlistId: confidencePlaylist.id
      },
      // Self Love affirmations
      {
        text: "I am worthy of love, respect, and happiness",
        audioUrl: "/audio/affirmations/self-love-1.mp3",
        duration: 75,
        playlistId: selfLovePlaylist.id
      },
      {
        text: "I accept myself fully for who I am",
        audioUrl: "/audio/affirmations/self-love-2.mp3",
        duration: 75,
        playlistId: selfLovePlaylist.id
      },
      {
        text: "I am enough, just as I am",
        audioUrl: "/audio/affirmations/self-love-3.mp3",
        duration: 75,
        playlistId: selfLovePlaylist.id
      }
    ]);

    // Add background music
    console.log("Adding background music...");
    await db.insert(backgroundMusics).values([
      {
        name: "Calm Meditation",
        audioUrl: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=empty-mind-118973.mp3",
        category: "Relax"
      },
      {
        name: "Peaceful Nature",
        audioUrl: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0c6ff1ac9.mp3?filename=forest-with-small-river-birds-and-nature-field-recording-6735.mp3",
        category: "Nature"
      },
      {
        name: "Deep Focus",
        audioUrl: "https://cdn.pixabay.com/download/audio/2022/08/02/audio_884fe92c21.mp3?filename=lifelike-126735.mp3",
        category: "Focus"
      },
      {
        name: "Gentle Rain",
        audioUrl: "https://cdn.pixabay.com/download/audio/2021/08/09/audio_88447e769f.mp3?filename=rain-and-thunder-16705.mp3",
        category: "Nature"
      }
    ]);

    // Add subscription plans
    console.log("Adding subscription plans...");
    await db.insert(subscriptionPlans).values([
      {
        name: "Free Plan",
        description: "Basic access to limited affirmations",
        price: "0.00",
        duration: 30,
        features: ["5 affirmations per day", "Basic categories", "Standard audio quality"],
        isActive: true
      },
      {
        name: "Premium Monthly",
        description: "Full access to all premium features",
        price: "9.99",
        duration: 30,
        features: [
          "Unlimited affirmations",
          "All categories",
          "Premium audio quality",
          "Background music",
          "Offline downloads",
          "Priority support"
        ],
        isActive: true
      },
      {
        name: "Premium Yearly",
        description: "Full access with 2 months free",
        price: "99.99",
        duration: 365,
        features: [
          "Unlimited affirmations",
          "All categories",
          "Premium audio quality",
          "Background music",
          "Offline downloads",
          "Priority support",
          "2 months free"
        ],
        isActive: true
      }
    ]);

    console.log("✅ Database reset and seeded successfully!");
    console.log("🎉 Your application is now ready with fresh data!");
    
  } catch (error) {
    console.error("❌ Error resetting database:", error);
    process.exit(1);
  }

  process.exit(0);
}

resetDatabase(); 