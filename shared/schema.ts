import { pgTable, text, serial, integer, boolean, timestamp, foreignKey, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  email: text("email"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
});

export const playlists = pgTable("playlists", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  duration: integer("duration").notNull(), // in seconds
  affirmationCount: integer("affirmation_count").notNull(),
  coverGradientStart: text("cover_gradient_start").notNull(),
  coverGradientEnd: text("cover_gradient_end").notNull(),
  icon: text("icon").notNull(),
  categoryId: integer("category_id").notNull().references(() => categories.id),
  isFeatured: boolean("is_featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const affirmations = pgTable("affirmations", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  audioUrl: text("audio_url").notNull(),
  duration: integer("duration").notNull(), // in seconds
  playlistId: integer("playlist_id").notNull().references(() => playlists.id),
});

export const backgroundMusics = pgTable("background_musics", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  audioUrl: text("audio_url").notNull(),
  category: text("category").notNull(), // e.g., Focus, Relax, Sleep, Nature
});

export const userFavorites = pgTable("user_favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  playlistId: integer("playlist_id").notNull().references(() => playlists.id),
});

export const recentPlays = pgTable("recent_plays", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  playlistId: integer("playlist_id").notNull().references(() => playlists.id),
  playedAt: timestamp("played_at").defaultNow(),
});

// NEW: Subscription Plans table
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  duration: integer("duration").notNull(), // in days
  features: text("features").array(), // Array of feature strings
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// NEW: User Subscriptions table
export const userSubscriptions = pgTable("user_subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  planId: integer("plan_id").notNull().references(() => subscriptionPlans.id),
  status: text("status").notNull().default("active"), // active, cancelled, expired
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userLikedAffirmations = pgTable("user_liked_affirmations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  affirmationId: integer("affirmation_id").notNull().references(() => affirmations.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// NEW: FCM Tokens table for push notifications
export const fcmTokens = pgTable("fcm_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  deviceType: text("device_type").notNull(), // 'ios', 'android', 'web'
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas for each table
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  avatarUrl: true,
});

export const insertCategorySchema = createInsertSchema(categories);

export const insertPlaylistSchema = createInsertSchema(playlists).pick({
  title: true,
  description: true,
  duration: true,
  affirmationCount: true,
  coverGradientStart: true,
  coverGradientEnd: true,
  icon: true,
  categoryId: true,
  isFeatured: true,
});

export const insertAffirmationSchema = createInsertSchema(affirmations);

export const insertBackgroundMusicSchema = createInsertSchema(backgroundMusics);

export const insertUserFavoriteSchema = createInsertSchema(userFavorites);

export const insertRecentPlaySchema = createInsertSchema(recentPlays).pick({
  userId: true,
  playlistId: true,
});

// NEW: Insert schemas for subscription tables
export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).pick({
  name: true,
  description: true,
  price: true,
  duration: true,
  features: true,
  isActive: true,
});

export const insertUserSubscriptionSchema = createInsertSchema(userSubscriptions).pick({
  userId: true,
  planId: true,
  status: true,
  startDate: true,
  endDate: true,
});

export const insertUserLikedAffirmationSchema = createInsertSchema(userLikedAffirmations);

// NEW: Insert schema for FCM tokens
export const insertFcmTokenSchema = createInsertSchema(fcmTokens).pick({
  userId: true,
  token: true,
  deviceType: true,
  isActive: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Playlist = typeof playlists.$inferSelect;
export type InsertPlaylist = z.infer<typeof insertPlaylistSchema>;

export type Affirmation = typeof affirmations.$inferSelect;
export type InsertAffirmation = z.infer<typeof insertAffirmationSchema>;

export type BackgroundMusic = typeof backgroundMusics.$inferSelect;
export type InsertBackgroundMusic = z.infer<typeof insertBackgroundMusicSchema>;

export type UserFavorite = typeof userFavorites.$inferSelect;
export type InsertUserFavorite = z.infer<typeof insertUserFavoriteSchema>;

export type RecentPlay = typeof recentPlays.$inferSelect;
export type InsertRecentPlay = z.infer<typeof insertRecentPlaySchema>;

// NEW: Types for subscription tables
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;

export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type InsertUserSubscription = z.infer<typeof insertUserSubscriptionSchema>;

export type UserLikedAffirmation = typeof userLikedAffirmations.$inferSelect;
export type InsertUserLikedAffirmation = z.infer<typeof insertUserLikedAffirmationSchema>;

// NEW: Types for FCM tokens
export type FcmToken = typeof fcmTokens.$inferSelect;
export type InsertFcmToken = z.infer<typeof insertFcmTokenSchema>;

// Define relations between tables
export const usersRelations = relations(users, ({ many }) => ({
  userFavorites: many(userFavorites),
  recentPlays: many(recentPlays),
  userSubscriptions: many(userSubscriptions),
  fcmTokens: many(fcmTokens)
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  playlists: many(playlists)
}));

export const playlistsRelations = relations(playlists, ({ one, many }) => ({
  category: one(categories, {
    fields: [playlists.categoryId],
    references: [categories.id]
  }),
  affirmations: many(affirmations),
  userFavorites: many(userFavorites),
  recentPlays: many(recentPlays)
}));

export const affirmationsRelations = relations(affirmations, ({ one }) => ({
  playlist: one(playlists, {
    fields: [affirmations.playlistId],
    references: [playlists.id]
  })
}));

export const userFavoritesRelations = relations(userFavorites, ({ one }) => ({
  user: one(users, {
    fields: [userFavorites.userId],
    references: [users.id]
  }),
  playlist: one(playlists, {
    fields: [userFavorites.playlistId],
    references: [playlists.id]
  })
}));

export const recentPlaysRelations = relations(recentPlays, ({ one }) => ({
  user: one(users, {
    fields: [recentPlays.userId],
    references: [users.id]
  }),
  playlist: one(playlists, {
    fields: [recentPlays.playlistId],
    references: [playlists.id]
  })
}));

// NEW: Relations for subscription tables
export const subscriptionPlansRelations = relations(subscriptionPlans, ({ many }) => ({
  userSubscriptions: many(userSubscriptions)
}));

export const userSubscriptionsRelations = relations(userSubscriptions, ({ one }) => ({
  user: one(users, {
    fields: [userSubscriptions.userId],
    references: [users.id]
  }),
  plan: one(subscriptionPlans, {
    fields: [userSubscriptions.planId],
    references: [subscriptionPlans.id]
  })
}));

export const userLikedAffirmationsRelations = relations(userLikedAffirmations, ({ one }) => ({
  user: one(users, {
    fields: [userLikedAffirmations.userId],
    references: [users.id],
  }),
  affirmation: one(affirmations, {
    fields: [userLikedAffirmations.affirmationId],
    references: [affirmations.id],
  }),
}));
