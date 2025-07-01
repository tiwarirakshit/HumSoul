import express, { type Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { storage, DatabaseStorage, MemStorage } from "./storage";
import {
  insertPlaylistSchema,
  insertUserFavoriteSchema,
  insertRecentPlaySchema,
  insertUserLikedAffirmationSchema,
} from "@shared/schema";
import { z } from "zod";
import { text } from "stream/consumers";

// Configure multer for file uploads
const audioStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), "uploads", "audio");
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error as Error, "");
    }
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
  },
});

const backgroundMusicStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), "uploads", "background-music");
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error as Error, "");
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, `background-${uniqueSuffix}${extension}`);
  },
});

// File filter for audio files
const audioFileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = [
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/ogg",
    "audio/m4a",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only audio files are allowed (MP3, WAV, OGG, M4A)"));
  }
};

const uploadAffirmation = multer({
  storage: audioStorage,
  fileFilter: audioFileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

const uploadBackgroundMusic = multer({
  storage: backgroundMusicStorage,
  fileFilter: audioFileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for background music
  },
});

// Validation schemas
const createPlaylistSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().optional(),
  categoryId: z.number().int().positive(),
  isFeatured: z.boolean().optional().default(false),
  userId: z.number().int().positive(), // Creator of the playlist
  duration: z.number().int().nonnegative(),
  affirmationCount: z.number().int().nonnegative(),
  coverGradientStart: z.string().min(1),
  coverGradientEnd: z.string().min(1),
  icon: z.string().min(1),
});

const uploadAffirmationSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().optional(),
  playlistId: z.number().int().positive(),
  duration: z.number().positive().optional(), // Duration in seconds
});

const uploadBackgroundMusicSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  duration: z.number().positive().optional(),
});

const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
});

const createRatingSchema = z.object({
  userId: z.number().int().positive(),
  contentType: z.enum(["affirmation", "background_music", "playlist"]),
  contentId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
});

const createReviewSchema = z.object({
  userId: z.number().int().positive(),
  contentType: z.enum(["affirmation", "background_music", "playlist"]),
  contentId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  review: z.string().min(1, "Review text is required").max(1000),
  title: z.string().optional(),
});

// Add a helper to get the storage type
function getStorageType() {
  if (storage instanceof DatabaseStorage) return 'DatabaseStorage';
  if (storage instanceof MemStorage) return 'MemStorage';
  return 'UnknownStorage';
}

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

  // NEW: Create category route
  api.post("/categories", async (req, res) => {
    try {
      const categoryData = createCategorySchema.parse(req.body);

      // Check if category with same name already exists
      const existingCategories = await storage.getCategories();
      const nameExists = existingCategories.some(
        (cat) => cat.name.toLowerCase() === categoryData.name.toLowerCase()
      );

      if (nameExists) {
        return res
          .status(409)
          .json({ message: "Category with this name already exists" });
      }

      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid category data", errors: error.errors });
      }
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // NEW: Update category route
  api.put("/categories/:id", async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      if (isNaN(categoryId)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }

      const updateData = createCategorySchema.partial().parse(req.body);

      const categories = await storage.getCategories();
      const existingCategory = categories.find((cat) => cat.id === categoryId);
      if (!existingCategory) {
        return res.status(404).json({ message: "Category not found" });
      }

      // Check if new name conflicts with existing categories (excluding current one)
      if (updateData.name) {
        const nameExists = categories.some(
          (cat) =>
            cat.id !== categoryId &&
            cat.name.toLowerCase() === updateData.name!.toLowerCase()
        );

        if (nameExists) {
          return res
            .status(409)
            .json({ message: "Category with this name already exists" });
        }
      }

      const updatedCategory = await storage.updateCategory(
        categoryId,
        updateData
      );
      res.json(updatedCategory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid category data", errors: error.errors });
      }
      console.error("Error updating category:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // NEW: Delete category route
  api.delete("/categories/:id", async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      if (isNaN(categoryId)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }

      const categories = await storage.getCategories();
      const categoryExists = categories.some((cat) => cat.id === categoryId);
      if (!categoryExists) {
        return res.status(404).json({ message: "Category not found" });
      }

      // Check if category has associated playlists
      const playlists = await storage.getPlaylistsByCategory(categoryId);
      if (playlists.length > 0) {
        return res.status(400).json({
          message:
            "Cannot delete category with associated playlists. Please reassign or delete playlists first.",
        });
      }

      await storage.deleteCategory(categoryId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Playlist routes
  api.get("/playlists", async (req, res) => {
    const categoryId = req.query.categoryId
      ? parseInt(req.query.categoryId as string)
      : undefined;

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

  // NEW: Create playlist route
  api.post("/playlists", async (req, res) => {
    try {
      const playlistData = createPlaylistSchema.parse(req.body);

      // Verify user exists
      const user = 2
      console.log(user, "user data", playlistData);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Verify category exists
      const categories = await storage.getCategories();
      const categoryExists = categories.some(
        (cat) => cat.id === playlistData.categoryId
      );
      if (!categoryExists) {
        return res.status(404).json({ message: "Category not found" });
      }

      const playlist = await storage.createPlaylist(playlistData);
      res.status(201).json(playlist);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid playlist data", errors: error.errors });
      }
      console.error("Error creating playlist:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  

  // NEW: Update playlist route
  api.put("/playlists/:id", async (req, res) => {
    try {
      const playlistId = parseInt(req.params.id);
      if (isNaN(playlistId)) {
        return res.status(400).json({ message: "Invalid playlist ID" });
      }

      const updateData = createPlaylistSchema.partial().parse(req.body);

      const existingPlaylist = await storage.getPlaylist(playlistId);
      if (!existingPlaylist) {
        return res.status(404).json({ message: "Playlist not found" });
      }

      const updatedPlaylist = await storage.updatePlaylist(
        playlistId,
        updateData
      );
      res.json(updatedPlaylist);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid playlist data", errors: error.errors });
      }
      console.error("Error updating playlist:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // NEW: Delete playlist route
  api.delete("/playlists/:id", async (req, res) => {
    try {
      const playlistId = parseInt(req.params.id);
      if (isNaN(playlistId)) {
        return res.status(400).json({ message: "Invalid playlist ID" });
      }

      const playlist = await storage.getPlaylist(playlistId);
      if (!playlist) {
        return res.status(404).json({ message: "Playlist not found" });
      }

      await storage.deletePlaylist(playlistId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting playlist:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Affirmation routes
  api.get("/affirmations", async (req, res) => {
    const playlistId = req.query.playlistId
      ? parseInt(req.query.playlistId as string)
      : undefined;

    if (!playlistId || isNaN(playlistId)) {
      return res.status(400).json({ message: "Playlist ID is required" });
    }

    const affirmations = await storage.getAffirmationsByPlaylist(playlistId);
    res.json(affirmations);
  });

  // NEW: Upload affirmation audio route
  api.post(
    "/affirmations/upload",
    uploadAffirmation.single("audio"),
    async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ message: "No audio file provided" });
        }

        const affirmationData = uploadAffirmationSchema.parse({
          ...req.body,
          playlistId: parseInt(req.body.playlistId),
          duration: req.body.duration ? parseInt(req.body.duration) : undefined,
          text: req.body.text
            ? req.body.text
            : req.file.originalname.split(".")[0],
          title: req.body.title
            ? req.body.title
            : req.file.originalname.split(".")[0],
        });

        // Verify playlist exists
        const playlist = await storage.getPlaylist(affirmationData.playlistId);
        if (!playlist) {
          // Clean up uploaded file if playlist doesn't exist
          await fs.unlink(req.file.path).catch(console.error);
          return res.status(404).json({ message: "Playlist not found" });
        }
        const audioUrl = '/audio/' + req.file.filename;
        console.log("🔊 Audio URL:", audioUrl); // <-- Add this log
        const affirmation = await storage.createAffirmation({
          ...affirmationData,
          duration: affirmationData.duration ?? 1,
          audioUrl: '/audio/' + req.file.filename,
          text: req.body.text
            ? req.body.text
            : req.file.originalname.split(".")[0],
        });
        console.log("✅ File saved at:", req.file?.path);

        res.status(201).json(affirmation);
      } catch (error) {
        // Clean up uploaded file on error
        if (req.file) {
          await fs.unlink(req.file.path).catch(console.error);
        }

        if (error instanceof z.ZodError) {
          return res
            .status(400)
            .json({
              message: "Invalid affirmation data",
              errors: error.errors,
            });
        }
        console.error("Error uploading affirmation:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  );

  // NEW: Upload affirmation audio file only (for editing)
  api.post(
    "/affirmations/upload-audio",
    uploadAffirmation.single("audio"),
    async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ message: "No audio file provided" });
        }
        // Just return the audioUrl, do not create a DB record
        res.status(201).json({ audioUrl: '/audio/' + req.file.filename });
      } catch (error) {
        // Clean up uploaded file on error
        if (req.file) {
          await fs.unlink(req.file.path).catch(console.error);
        }
        console.error("Error uploading audio file:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  );

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

  // NEW: Upload background music route
  api.post(
    "/background-music/upload",
    uploadBackgroundMusic.single("audio"),
    async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ message: "No audio file provided" });
        }

        const musicData = uploadBackgroundMusicSchema.parse({
          ...req.body,
          duration: req.body.duration
            ? parseFloat(req.body.duration)
            : undefined,
        });

        // Create background music record with file path
        const backgroundMusic = await storage.createBackgroundMusic({
          ...musicData,
          fileName: req.file.filename,
          filePath: req.file.path,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
        });

        res.status(201).json(backgroundMusic);
      } catch (error) {
        // Clean up uploaded file on error
        if (req.file) {
          await fs.unlink(req.file.path).catch(console.error);
        }

        if (error instanceof z.ZodError) {
          return res
            .status(400)
            .json({
              message: "Invalid background music data",
              errors: error.errors,
            });
        }
        console.error("Error uploading background music:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  );

  // User Favorites routes
  api.get("/favorites", async (req, res) => {
    const userId = req.query.userId
      ? parseInt(req.query.userId as string)
      : undefined;

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const favorites = await storage.getUserFavorites(userId);
    res.json({
      debug: {
        storageType: getStorageType(),
        raw: favorites
      },
      data: favorites
    });
  });

  api.post("/favorites", async (req, res) => {
    try {
      const favoriteData = insertUserFavoriteSchema.parse(req.body);
      const existingFavorite = await storage.isPlaylistFavorited(
        favoriteData.userId,
        favoriteData.playlistId
      );

      if (existingFavorite) {
        return res
          .status(409)
          .json({ message: "Playlist is already favorited" });
      }

      const favorite = await storage.addUserFavorite(favoriteData);
      res.status(201).json(favorite);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid favorite data", errors: error.errors });
      }
      throw error;
    }
  });

  api.delete("/favorites", async (req, res) => {
    const userId = req.query.userId
      ? parseInt(req.query.userId as string)
      : undefined;
    const playlistId = req.query.playlistId
      ? parseInt(req.query.playlistId as string)
      : undefined;

    if (!userId || isNaN(userId) || !playlistId || isNaN(playlistId)) {
      return res
        .status(400)
        .json({ message: "User ID and Playlist ID are required" });
    }

    await storage.removeUserFavorite(userId, playlistId);
    res.status(204).send();
  });

  api.get("/favorites/check", async (req, res) => {
    const userId = req.query.userId
      ? parseInt(req.query.userId as string)
      : undefined;
    const playlistId = req.query.playlistId
      ? parseInt(req.query.playlistId as string)
      : undefined;

    if (!userId || isNaN(userId) || !playlistId || isNaN(playlistId)) {
      return res
        .status(400)
        .json({ message: "User ID and Playlist ID are required" });
    }

    const isFavorited = await storage.isPlaylistFavorited(userId, playlistId);
    res.json({ isFavorited });
  });

  // Recent Plays routes
  api.get("/recent-plays", async (req, res) => {
    const userId = req.query.userId
      ? parseInt(req.query.userId as string)
      : undefined;

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const recentPlays = await storage.getRecentPlays(userId);
    res.json({
      debug: {
        storageType: getStorageType(),
        raw: recentPlays
      },
      data: recentPlays
    });
  });

  api.post("/recent-plays", async (req, res) => {
    try {
      const recentPlayData = insertRecentPlaySchema.parse(req.body);
      const recentPlay = await storage.addRecentPlay(recentPlayData);
      res.status(201).json(recentPlay);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid recent play data", errors: error.errors });
      }
      throw error;
    }
  });

  api.get("/admin/dashboard-stats", async (req, res) => {
  try {
    const stats = await storage.getDashboardStats();
    res.json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

api.get("/admin/users", async (req, res) => {
  try {
    const filters: AdminUserFilters = {
      search: req.query.search as string,
      status: req.query.status as "active" | "suspended",
      subscriptionStatus: req.query.subscriptionStatus as "free" | "premium"
    };

    const users = await storage.getAdminUsers(filters);
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get single user
api.get("/admin/users/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const user = await storage.getAdminUser(id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update user
api.put("/admin/users/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updates: UpdateUserRequest = req.body;
    
    const user = await storage.updateAdminUser(id, updates);
    res.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    if (error.message.includes("not found")) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create user
api.post("/admin/users", async (req, res) => {
  try {
    const userReq: CreateUserRequest = req.body;
    
    // Validate required fields
    if (!userReq.name || !userReq.email || !userReq.username || !userReq.password) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    const user = await storage.createAdminUser(userReq);
    res.status(201).json(user);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete user
api.delete("/admin/users/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteAdminUser(id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting user:", error);
    if (error.message.includes("not found")) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
});

  // Serve uploaded audio files
  api.get("/audio/affirmations/:file", async (req, res) => {
    try {
      const filePath = path.join(
        process.cwd(),
        "client",
        "public",
        "audio",
        req.params.file
      );

      // Check if file exists
      await fs.access(filePath);

      // Set appropriate headers for audio streaming
      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader("Accept-Ranges", "bytes");

      // Stream the file
      res.sendFile(filePath);
    } catch (error) {
      res.status(404).json({ message: "Audio file not found" });
    }
  });

  // Add DELETE endpoint for affirmations
  api.delete("/affirmations/:id", async (req, res) => {
    try {
      const affirmationId = parseInt(req.params.id);
      if (isNaN(affirmationId)) {
        return res.status(400).json({ message: "Invalid affirmation ID" });
      }
      const affirmation = await storage.getAffirmation(affirmationId);
      if (!affirmation) {
        return res.status(404).json({ message: "Affirmation not found" });
      }
      // Optionally: delete the audio file from disk here
      await storage.deleteAffirmation(affirmationId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting affirmation:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Add PUT endpoint for affirmations (edit)
  api.put("/affirmations/:id", async (req, res) => {
    try {
      const affirmationId = parseInt(req.params.id);
      if (isNaN(affirmationId)) {
        return res.status(400).json({ message: "Invalid affirmation ID" });
      }
      const updateData = uploadAffirmationSchema.partial().parse(req.body);
      const affirmation = await storage.getAffirmation(affirmationId);
      if (!affirmation) {
        return res.status(404).json({ message: "Affirmation not found" });
      }
      const updatedAffirmation = await storage.updateAffirmation(affirmationId, updateData);
      res.json(updatedAffirmation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid affirmation data", errors: error.errors });
      }
      console.error("Error updating affirmation:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all subscriptions for admin
  api.get("/admin/subscriptions", async (req, res) => {
    try {
      const subscriptions = await storage.getUserSubscriptions();
      res.json(subscriptions);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all subscription plans for admin
  api.get("/admin/plans", async (req, res) => {
    try {
      const plans = await storage.getSubscriptionPlans();
      res.json(plans);
    } catch (error) {
      console.error("Error fetching plans:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all active subscription plans for users
  api.get("/plans", async (req, res) => {
    try {
      const allPlans = await storage.getSubscriptionPlans();
      // Filter to only show active plans for users
      const activePlans = allPlans.filter(plan => plan.isActive);
      res.json(activePlans);
    } catch (error) {
      console.error("Error fetching plans:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create subscription plan
  api.post("/admin/plans", async (req, res) => {
    try {
      console.log("Received plan creation request:", {
        body: req.body,
        duration: req.body.duration,
        durationType: typeof req.body.duration,
        price: req.body.price,
        priceType: typeof req.body.price
      });

      const duration = parseInt(req.body.duration);
      console.log("Parsed duration:", duration, "isNaN:", isNaN(duration));
      
      if (isNaN(duration) || duration <= 0) {
        console.log("Duration validation failed:", { duration, isNaN: isNaN(duration) });
        return res.status(400).json({ 
          message: "Invalid duration. Duration must be a positive number.",
          received: req.body.duration,
          parsed: duration
        });
      }

      const price = parseFloat(req.body.price);
      console.log("Parsed price:", price, "isNaN:", isNaN(price));
      
      if (isNaN(price) || price < 0) {
        console.log("Price validation failed:", { price, isNaN: isNaN(price) });
        return res.status(400).json({ 
          message: "Invalid price. Price must be a positive number.",
          received: req.body.price,
          parsed: price
        });
      }

      const planData = {
        name: req.body.name,
        description: req.body.description,
        price: price.toString(),
        duration: duration,
        features: req.body.features || [],
        isActive: req.body.isActive !== undefined ? req.body.isActive : true
      };

      console.log("Final plan data:", planData);

      const plan = await storage.createSubscriptionPlan(planData);
      res.status(201).json(plan);
    } catch (error) {
      console.error("Error creating plan:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update subscription plan
  api.put("/admin/plans/:id", async (req, res) => {
    try {
      const planId = parseInt(req.params.id);
      if (isNaN(planId)) {
        return res.status(400).json({ message: "Invalid plan ID" });
      }

      const updateData: any = {
        name: req.body.name,
        description: req.body.description,
        features: req.body.features,
        isActive: req.body.isActive
      };

      if (req.body.price !== undefined) {
        const price = parseFloat(req.body.price);
        if (isNaN(price) || price < 0) {
          return res.status(400).json({ 
            message: "Invalid price. Price must be a positive number." 
          });
        }
        updateData.price = price.toString();
      }

      if (req.body.duration !== undefined) {
        const duration = parseInt(req.body.duration);
        if (isNaN(duration) || duration <= 0) {
          return res.status(400).json({ 
            message: "Invalid duration. Duration must be a positive number." 
          });
        }
        updateData.duration = duration;
      }

      const plan = await storage.updateSubscriptionPlan(planId, updateData);
      res.json(plan);
    } catch (error) {
      console.error("Error updating plan:", error);
      if (error.message.includes("not found")) {
        return res.status(404).json({ message: "Plan not found" });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete subscription plan
  api.delete("/admin/plans/:id", async (req, res) => {
    try {
      const planId = parseInt(req.params.id);
      if (isNaN(planId)) {
        return res.status(400).json({ message: "Invalid plan ID" });
      }

      await storage.deleteSubscriptionPlan(planId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting plan:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update subscription status
  api.put("/admin/subscriptions/:id", async (req, res) => {
    try {
      const subscriptionId = parseInt(req.params.id);
      if (isNaN(subscriptionId)) {
        return res.status(400).json({ message: "Invalid subscription ID" });
      }

      const updateData = {
        status: req.body.status,
        startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
        endDate: req.body.endDate ? new Date(req.body.endDate) : undefined
      };

      const subscription = await storage.updateUserSubscription(subscriptionId, updateData);
      res.json(subscription);
    } catch (error) {
      console.error("Error updating subscription:", error);
      if (error.message.includes("not found")) {
        return res.status(404).json({ message: "Subscription not found" });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create or update user (upsert)
  api.post("/users", async (req, res) => {
    const { uid, email, name, username, avatarUrl, isSubscribed, subscriptionStatus } = req.body;
    if (!email || !uid) {
      return res.status(400).json({ message: "Missing email or uid" });
    }

    // Try to find user by email
    let user = await storage.getUserByEmail(email);
    if (user) {
      // Update user info if needed
      user = await storage.updateUser(user.id, {
        name,
        username,
        avatarUrl,
        isSubscribed,
        subscriptionStatus,
      });
      return res.status(200).json(user);
    } else {
      // Create new user
      const newUser = await storage.createUser({
        email,
        username,
        name,
        avatarUrl,
        password: "", // Not used for Google users
        isSubscribed,
        subscriptionStatus,
      });
      return res.status(201).json(newUser);
    }
  });

  // Liked Affirmations routes
  api.get("/liked-affirmations", async (req, res) => {
    const userId = Number(req.query.userId);
    if (!userId) return res.status(400).json({ message: "Missing userId" });
    const liked = await storage.getUserLikedAffirmations(userId);
    res.json({
      debug: {
        storageType: getStorageType(),
        raw: liked
      },
      data: liked
    });
  });

  api.post("/liked-affirmations", async (req, res) => {
    try {
      const likeData = insertUserLikedAffirmationSchema.parse(req.body);
      const like = await storage.addUserLikedAffirmation(likeData);
      res.status(201).json(like);
    } catch (error: any) {
      res.status(400).json({ message: "Invalid like data", errors: error.errors });
    }
  });

  api.delete("/liked-affirmations", async (req, res) => {
    const userId = Number(req.query.userId);
    const affirmationId = Number(req.query.affirmationId);
    if (!userId || !affirmationId) return res.status(400).json({ message: "Missing userId or affirmationId" });
    await storage.removeUserLikedAffirmation(userId, affirmationId);
    res.status(204).end();
  });

  api.get("/liked-affirmations/check", async (req, res) => {
    const userId = Number(req.query.userId);
    const affirmationId = Number(req.query.affirmationId);
    if (!userId || !affirmationId) return res.status(400).json({ message: "Missing userId or affirmationId" });
    const liked = await storage.isAffirmationLiked(userId, affirmationId);
    res.json({ liked });
  });

  // Mount the API routes
  app.use("/api", api);

  // Add 404 handler for API routes
  app.use("/api/*", (req, res) => {
    res.status(404).json({ 
      message: "API endpoint not found",
      path: req.path,
      method: req.method
    });
  });

  // Create and return the HTTP server
  const server = createServer(app);
  return server;
}
