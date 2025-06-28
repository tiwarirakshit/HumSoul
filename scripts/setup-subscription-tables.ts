import { db } from "../server/db";

async function setupSubscriptionTables() {
  console.log("🔧 Setting up subscription tables...");

  try {
    // Create subscription_plans table
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
    console.log("✅ Created subscription_plans table");

    // Create user_subscriptions table
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
    console.log("✅ Created user_subscriptions table");

    // Add foreign key constraints
    await db.execute(`
      ALTER TABLE user_subscriptions 
      ADD CONSTRAINT IF NOT EXISTS user_subscriptions_user_id_users_id_fk 
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    `);
    console.log("✅ Added user_id foreign key constraint");

    await db.execute(`
      ALTER TABLE user_subscriptions 
      ADD CONSTRAINT IF NOT EXISTS user_subscriptions_plan_id_subscription_plans_id_fk 
      FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE CASCADE;
    `);
    console.log("✅ Added plan_id foreign key constraint");

    console.log("🎉 All subscription tables created successfully!");
  } catch (error) {
    console.error("❌ Error creating tables:", error);
  }

  process.exit(0);
}

setupSubscriptionTables(); 