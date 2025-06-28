import { db } from "../server/db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";

async function checkUser() {
  console.log("🔍 Checking user ID 1 in database...");

  try {
    const user = await db.select().from(users).where(eq(users.id, 1));
    
    if (user.length === 0) {
      console.log("❌ User ID 1 not found in database");
    } else {
      console.log("✅ User ID 1 found:", user[0]);
    }
  } catch (error) {
    console.error("Error checking user:", error);
  }

  process.exit(0);
}

checkUser(); 