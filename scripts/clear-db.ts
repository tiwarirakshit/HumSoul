import { db } from "../server/db";
import { categories, playlists, affirmations, backgroundMusics } from "../shared/schema";

async function clearDB() {
  console.log("🧹 Clearing the database...");

  try {
    // Clear in reverse dependency order
    await db.delete(affirmations);
    await db.delete(playlists);
    await db.delete(backgroundMusics);
    await db.delete(categories);

    console.log("✅ Database cleared.");
  } catch (err) {
    console.error("❌ Error clearing database:", err);
    process.exit(1);
  }

  process.exit(0);
}

clearDB();
