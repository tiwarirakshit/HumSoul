import { db } from "../server/db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";

async function createAdminUser() {
  console.log("👤 Creating admin user...");

  try {
    // Check if admin user already exists
    const existingUser = await db.select().from(users).where(eq(users.username, "admin"));
    
    if (existingUser.length > 0) {
      console.log("✅ Admin user already exists!");
      return;
    }

    // Create admin user
    const [adminUser] = await db.insert(users).values({
      username: "admin",
      password: "admin123", // You should hash this in production
      name: "Admin User",
      email: "admin@humsoul.com",
      avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80"
    }).returning();

    console.log("✅ Admin user created successfully!");
    console.log("User ID:", adminUser.id);
    console.log("Username:", adminUser.username);
    console.log("Email:", adminUser.email);
  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exit(1);
  }

  process.exit(0);
}

createAdminUser(); 