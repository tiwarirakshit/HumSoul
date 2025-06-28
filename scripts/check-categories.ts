import { db } from "../server/db";
import { categories } from "../shared/schema";

async function checkCategories() {
  console.log("🔍 Checking categories in database...");

  try {
    const allCategories = await db.select().from(categories);
    
    console.log("📋 Categories found in database:");
    if (allCategories.length === 0) {
      console.log("❌ No categories found in database");
    } else {
      allCategories.forEach((category, index) => {
        console.log(`${index + 1}. ID: ${category.id}, Name: ${category.name}, Icon: ${category.icon}, Color: ${category.color}`);
      });
    }
  } catch (error) {
    console.error("Error checking categories:", error);
  }

  process.exit(0);
}

checkCategories(); 