import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPlaylistSchema, insertUserFavoriteSchema, insertRecentPlaySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  const api = express.Router();

  // User routes
  api.get("/users/:id", async (req, res) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Don't send password to the client
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  // Category routes
  api.get("/categories", async (req, res) => {
    const categories = await storage.getCategories();
    res.json(categories);
  });

  // Playlist routes
  api.get("/playlists", async (req, res) => {
    const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
    
    let playlists;
    if (categoryId && !isNaN(categoryId)) {
      playlists = await storage.getPlaylistsByCategory(categoryId);
    } else {
      playlists = await storage.getPlaylists();
    }
    
    res.json(playlists);
  });

  api.get("/playlists/featured", async (req, res) => {
    const featuredPlaylists = await storage.getFeaturedPlaylists();
    res.json(featuredPlaylists);
  });

  api.get("/playlists/:id", async (req, res) => {
    const playlistId = parseInt(req.params.id);
    if (isNaN(playlistId)) {
      return res.status(400).json({ message: "Invalid playlist ID" });
    }

    const playlist = await storage.getPlaylist(playlistId);
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    res.json(playlist);
  });

  // Affirmation routes
  api.get("/affirmations", async (req, res) => {
    const playlistId = req.query.playlistId ? parseInt(req.query.playlistId as string) : undefined;
    
    if (!playlistId || isNaN(playlistId)) {
      return res.status(400).json({ message: "Playlist ID is required" });
    }
    
    const affirmations = await storage.getAffirmationsByPlaylist(playlistId);
    res.json(affirmations);
  });

  // Background Music routes
  api.get("/background-music", async (req, res) => {
    const category = req.query.category as string | undefined;
    
    let music;
    if (category) {
      music = await storage.getBackgroundMusicsByCategory(category);
    } else {
      music = await storage.getBackgroundMusics();
    }
    
    res.json(music);
  });

  // User Favorites routes
  api.get("/favorites", async (req, res) => {
    const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
    
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ message: "User ID is required" });
    }
    
    const favorites = await storage.getUserFavorites(userId);
    res.json(favorites);
  });

  api.post("/favorites", async (req, res) => {
    try {
      const favoriteData = insertUserFavoriteSchema.parse(req.body);
      const existingFavorite = await storage.isPlaylistFavorited(favoriteData.userId, favoriteData.playlistId);
      
      if (existingFavorite) {
        return res.status(409).json({ message: "Playlist is already favorited" });
      }
      
      const favorite = await storage.addUserFavorite(favoriteData);
      res.status(201).json(favorite);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid favorite data", errors: error.errors });
      }
      throw error;
    }
  });

  api.delete("/favorites", async (req, res) => {
    const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
    const playlistId = req.query.playlistId ? parseInt(req.query.playlistId as string) : undefined;
    
    if (!userId || isNaN(userId) || !playlistId || isNaN(playlistId)) {
      return res.status(400).json({ message: "User ID and Playlist ID are required" });
    }
    
    await storage.removeUserFavorite(userId, playlistId);
    res.status(204).send();
  });

  api.get("/favorites/check", async (req, res) => {
    const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
    const playlistId = req.query.playlistId ? parseInt(req.query.playlistId as string) : undefined;
    
    if (!userId || isNaN(userId) || !playlistId || isNaN(playlistId)) {
      return res.status(400).json({ message: "User ID and Playlist ID are required" });
    }
    
    const isFavorited = await storage.isPlaylistFavorited(userId, playlistId);
    res.json({ isFavorited });
  });

  // Recent Plays routes
  api.get("/recent-plays", async (req, res) => {
    const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
    
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ message: "User ID is required" });
    }
    
    const recentPlays = await storage.getRecentPlays(userId);
    res.json(recentPlays);
  });

  api.post("/recent-plays", async (req, res) => {
    try {
      const recentPlayData = insertRecentPlaySchema.parse(req.body);
      const recentPlay = await storage.addRecentPlay(recentPlayData);
      res.status(201).json(recentPlay);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid recent play data", errors: error.errors });
      }
      throw error;
    }
  });

  // Mock audio endpoints for development
  api.get("/audio/affirmations/:file", (req, res) => {
    // In a real app, we would serve actual audio files
    // For this prototype, we're just acknowledging the request
    res.status(200).json({ message: `Audio file ${req.params.file} would be streamed here` });
  });

  api.get("/audio/background/:file", (req, res) => {
    // In a real app, we would serve actual audio files
    // For this prototype, we're just acknowledging the request
    res.status(200).json({ message: `Background audio file ${req.params.file} would be streamed here` });
  });

  // Mount API routes
  app.use("/api", api);

  const httpServer = createServer(app);
  return httpServer;
}
