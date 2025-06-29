import { db } from "../server/db";
import { subscriptionPlans } from "../shared/schema";

async function seedSubscriptionPlans() {
  console.log("🌱 Seeding subscription plans...");

  try {
    // Check if plans already exist
    const existingPlans = await db.select().from(subscriptionPlans);
    if (existingPlans.length > 0) {
      console.log("✅ Subscription plans already exist, skipping seed");
      process.exit(0);
    }

    // Add subscription plans
    const plans = await db.insert(subscriptionPlans).values([
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
        price: "799.00",
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
        price: "7999.00",
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
    ]).returning();

    console.log("✅ Seeded subscription plans:", plans.length);
    plans.forEach(plan => {
      console.log(`  - ${plan.name}: $${plan.price} (${plan.duration} days)`);
    });
  } catch (error) {
    console.error("Error seeding subscription plans:", error);
  }

  process.exit(0);
}

seedSubscriptionPlans(); 