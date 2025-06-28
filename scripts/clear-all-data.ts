import { db } from "../server/db";
import { 
  userSubscriptions, 
  subscriptionPlans, 
  recentPlays, 
  userFavorites, 
  affirmations, 
  playlists, 
  categories, 
  backgroundMusics, 
  users 
} from "../shared/schema";

async function clearAllData() {
  console.log("🧹 Starting to clear all data from database...");

  try {
    // Clear data in the correct order (respecting foreign key constraints)
    console.log("Clearing user subscriptions...");
    await db.delete(userSubscriptions);
    console.log("✓ User subscriptions cleared");

    console.log("Clearing subscription plans...");
    await db.delete(subscriptionPlans);
    console.log("✓ Subscription plans cleared");

    console.log("Clearing recent plays...");
    await db.delete(recentPlays);
    console.log("✓ Recent plays cleared");

    console.log("Clearing user favorites...");
    await db.delete(userFavorites);
    console.log("✓ User favorites cleared");

    console.log("Clearing affirmations...");
    await db.delete(affirmations);
    console.log("✓ Affirmations cleared");

    console.log("Clearing playlists...");
    await db.delete(playlists);
    console.log("✓ Playlists cleared");

    console.log("Clearing categories...");
    await db.delete(categories);
    console.log("✓ Categories cleared");

    console.log("Clearing background music...");
    await db.delete(backgroundMusics);
    console.log("✓ Background music cleared");

    console.log("Clearing users...");
    await db.delete(users);
    console.log("✓ Users cleared");

    console.log("✅ Successfully cleared all data from database!");
    console.log("💡 Run 'npm run db:seed' to add fresh sample data");
    
  } catch (error) {
    console.error("❌ Error clearing data:", error);
    process.exit(1);
  }

  process.exit(0);
}

clearAllData(); 