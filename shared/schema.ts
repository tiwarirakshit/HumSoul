import { pgTable, text, serial, integer, boolean, timestamp, foreignKey } from "drizzle-orm/pg-core";
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

// Define relations between tables
export const usersRelations = relations(users, ({ many }) => ({
  userFavorites: many(userFavorites),
  recentPlays: many(recentPlays)
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
