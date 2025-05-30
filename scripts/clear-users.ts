import { db } from "../server/db";
import { userFavorites, recentPlays, users } from "../shared/schema";

async function clearUserData() {
  console.log("Starting to clear user data...");

  try {
    // Delete user favorites
    console.log("Deleting user favorites...");
    await db.delete(userFavorites);
    console.log("✓ User favorites deleted");

    // Delete recent plays
    console.log("Deleting recent plays...");
    await db.delete(recentPlays);
    console.log("✓ Recent plays deleted");

    // Delete users
    console.log("Deleting users...");
    await db.delete(users);
    console.log("✓ Users deleted");

    console.log("Successfully cleared all user data!");
  } catch (error) {
    console.error("Error clearing user data:", error);
    process.exit(1);
  }

  process.exit(0);
}

clearUserData(); 