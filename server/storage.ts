import {
  users,
  categories,
  playlists,
  affirmations,
  backgroundMusics,
  userFavorites,
  recentPlays,
  type User,
  type InsertUser,
  type Category,
  type InsertCategory,
  type Playlist,
  type InsertPlaylist,
  type Affirmation,
  type InsertAffirmation,
  type BackgroundMusic,
  type InsertBackgroundMusic,
  type UserFavorite,
  type InsertUserFavorite,
  type RecentPlay,
  type InsertRecentPlay,
} from "@shared/schema";

export interface AdminUser {
  id: number;
  name: string | null;  
  email: string | null;
  username: string;
  status: "active" | "suspended";
  subscriptionStatus: "free" | "premium";
  joinedAt: Date;
  lastLogin: Date | null;
  avatarUrl: string | null;
}

export interface AdminUserFilters {
  search?: string;
  status?: "active" | "suspended";
  subscriptionStatus?: "free" | "premium";
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  status?: "active" | "suspended";
  subscriptionStatus?: "free" | "premium";
}

export interface CreateUserRequest {
  name: string;
  email: string;
  username: string;
  password: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalTracks: number;
  totalSubscribers: number;
  totalPlays: number;
  userGrowthPercent: number;
  newTracksThisWeek: number;
  conversionRate: number;
  playsGrowthPercent: number;
  userGrowth: Array<{ name: string; users: number }>;
  listeningData: Array<{ name: string; minutes: number }>;
  subscriptionData: Array<{ name: string; value: number }>;
  categoryData: Array<{ name: string; value: number }>;
}
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Category methods
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: number): Promise<void>;
getDashboardStats(): Promise<DashboardStats>;
getAdminUsers(filters?: AdminUserFilters): Promise<AdminUser[]>;
  getAdminUser(id: number): Promise<AdminUser | undefined>;
  updateAdminUser(id: number, updates: UpdateUserRequest): Promise<AdminUser>;
  createAdminUser(user: CreateUserRequest): Promise<AdminUser>;
  deleteAdminUser(id: number): Promise<void>;
  getUsersCount(): Promise<number>;
  // Playlist methods
  getPlaylists(): Promise<Playlist[]>;
  getPlaylistsByCategory(categoryId: number): Promise<Playlist[]>;
  getFeaturedPlaylists(): Promise<Playlist[]>;
  getPlaylist(id: number): Promise<Playlist | undefined>;
  createPlaylist(playlist: InsertPlaylist): Promise<Playlist>;
  updatePlaylist(id: number, playlist: Partial<InsertPlaylist>): Promise<Playlist>;
  deletePlaylist(id: number): Promise<void>;

  // Affirmation methods
  getAffirmationsByPlaylist(playlistId: number): Promise<Affirmation[]>;
  getAffirmation(id: number): Promise<Affirmation | undefined>;
  createAffirmation(affirmation: InsertAffirmation): Promise<Affirmation>;

  // Background Music methods
  getBackgroundMusics(): Promise<BackgroundMusic[]>;
  getBackgroundMusicsByCategory(category: string): Promise<BackgroundMusic[]>;
  getBackgroundMusic(id: number): Promise<BackgroundMusic | undefined>;
  createBackgroundMusic(music: InsertBackgroundMusic & {
    fileName?: string;
    filePath?: string;
    fileSize?: number;
    mimeType?: string;
  }): Promise<BackgroundMusic>;

  

  // User Favorites methods
  getUserFavorites(userId: number): Promise<Playlist[]>;
  addUserFavorite(favorite: InsertUserFavorite): Promise<UserFavorite>;
  removeUserFavorite(userId: number, playlistId: number): Promise<void>;
  isPlaylistFavorited(userId: number, playlistId: number): Promise<boolean>;

  // Recent Plays methods
  getRecentPlays(userId: number): Promise<{ playlist: Playlist; playedAt: Date }[]>;
  addRecentPlay(recentPlay: InsertRecentPlay): Promise<RecentPlay>;
}



export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private playlists: Map<number, Playlist>;
  private affirmations: Map<number, Affirmation>;
  private backgroundMusics: Map<number, BackgroundMusic>;
  private userFavorites: Map<number, UserFavorite>;
  private recentPlays: Map<number, RecentPlay>;
  
  private userIdCounter: number = 1;
  private categoryIdCounter: number = 1;
  private playlistIdCounter: number = 1;
  private affirmationIdCounter: number = 1;
  private backgroundMusicIdCounter: number = 1;
  private userFavoriteIdCounter: number = 1;
  private recentPlayIdCounter: number = 1;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.playlists = new Map();
    this.affirmations = new Map();
    this.backgroundMusics = new Map();
    this.userFavorites = new Map();
    this.recentPlays = new Map();
    
    // Seed with initial data
    this.seedData();
  }

  async getAdminUsers(filters?: AdminUserFilters): Promise<AdminUser[]> {
    let userList = Array.from(this.users.values());

    // Apply filters
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      userList = userList.filter(user => 
        user.name?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.username.toLowerCase().includes(searchLower)
      );
    }

    if (filters?.status) {
      userList = userList.filter(user => {
        // Assuming you add a status field to User type, or default to "active"
        const status = (user as any).status || "active";
        return status === filters.status;
      });
    }

    if (filters?.subscriptionStatus) {
      userList = userList.filter(user => {
        // Mock subscription status based on some logic
        const subscriptionStatus = user.id === 1 ? "premium" : "free";
        return subscriptionStatus === filters.subscriptionStatus;
      });
    }

    return userList.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      status: (user as any).status || "active",
      subscriptionStatus: user.id === 1 ? "premium" : "free", // Mock data
      joinedAt: user.createdAt,
      lastLogin: user.createdAt, // Mock - you'd track this separately
      avatarUrl: user.avatarUrl
    }));
  }

  async getAdminUser(id: number): Promise<AdminUser | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      status: (user as any).status || "active",
      subscriptionStatus: user.id === 1 ? "premium" : "free",
      joinedAt: user.createdAt,
      lastLogin: user.createdAt,
      avatarUrl: user.avatarUrl
    };
  }

  async updateAdminUser(id: number, updates: UpdateUserRequest): Promise<AdminUser> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error(`User not found: ${id}`);
    }

    const updatedUser = {
      ...user,
      ...updates,
      name: updates.name !== undefined ? updates.name : user.name,
      email: updates.email !== undefined ? updates.email : user.email
    };

    this.users.set(id, updatedUser);
    return this.getAdminUser(id) as Promise<AdminUser>;
  }

  async createAdminUser(userReq: CreateUserRequest): Promise<AdminUser> {
    const newUser = await this.createUser({
      username: userReq.username,
      password: userReq.password,
      name: userReq.name,
      email: userReq.email
    });

    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      username: newUser.username,
      status: "active",
      subscriptionStatus: "free",
      joinedAt: newUser.createdAt,
      lastLogin: null,
      avatarUrl: newUser.avatarUrl
    };
  }

  async deleteAdminUser(id: number): Promise<void> {
    if (!this.users.has(id)) {
      throw new Error(`User not found: ${id}`);
    }

    // Remove user and related data
    this.users.delete(id);
    
    // Remove user favorites
    Array.from(this.userFavorites.entries()).forEach(([favoriteId, favorite]) => {
      if (favorite.userId === id) {
        this.userFavorites.delete(favoriteId);
      }
    });

    // Remove user recent plays
    Array.from(this.recentPlays.entries()).forEach(([playId, play]) => {
      if (play.userId === id) {
        this.recentPlays.delete(playId);
      }
    });
  }

  async getUsersCount(): Promise<number> {
    return this.users.size;
  }

   async getDashboardStats(): Promise<DashboardStats> {
    const totalUsers = this.users.size;
    const totalTracks = this.affirmations.size;
    const totalPlaylists = this.playlists.size;
    const totalPlays = this.recentPlays.size;
    
    // Calculate subscribers (assuming premium users - you might want to add a subscription field)
    const totalSubscribers = Math.floor(totalUsers * 0.15); // 15% conversion rate example
    
    // Mock growth data - in real implementation, you'd query historical data
    const now = new Date();
    const userGrowth = Array.from({ length: 6 }, (_, i) => {
      const monthsAgo = 5 - i;
      const date = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      const users = Math.floor(totalUsers * (0.5 + (i * 0.1))); // Simulated growth
      return { name: monthName, users };
    });

    // Mock listening data for the past week
    const listeningData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const minutes = Math.floor(Math.random() * 500) + 200; // Random listening time
      return { name: dayName, minutes };
    });

    // Mock subscription distribution
    const subscriptionData = [
      { name: 'Free', value: totalUsers - totalSubscribers },
      { name: 'Premium', value: totalSubscribers }
    ];

    // Calculate category popularity based on playlists
    const categoryStats = new Map<string, number>();
    this.playlists.forEach(playlist => {
      const category = this.categories.get(playlist.categoryId);
      if (category) {
        categoryStats.set(category.name, (categoryStats.get(category.name) || 0) + 1);
      }
    });

    const categoryData = Array.from(categoryStats.entries()).map(([name, value]) => ({
      name,
      value
    }));

    return {
      totalUsers,
      totalTracks,
      totalSubscribers,
      totalPlays,
      userGrowthPercent: 12.5, // Mock growth percentage
      newTracksThisWeek: 3, // Mock new tracks
      conversionRate: Math.round((totalSubscribers / totalUsers) * 100),
      playsGrowthPercent: 8.3, // Mock plays growth
      userGrowth,
      listeningData,
      subscriptionData,
      categoryData
    };
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    // Ensure nullable fields are explicitly set to null if undefined
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt,
      name: insertUser.name || null,
      email: insertUser.email || null,
      avatarUrl: insertUser.avatarUrl || null 
    };
    this.users.set(id, user);
    return user;
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryIdCounter++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  async updateCategory(id: number, categoryUpdate: Partial<InsertCategory>): Promise<Category> {
    const existingCategory = this.categories.get(id);
    if (!existingCategory) {
      throw new Error(`Category not found: ${id}`);
    }
    
    const updatedCategory: Category = { ...existingCategory, ...categoryUpdate };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<void> {
    if (!this.categories.has(id)) {
      throw new Error(`Category not found: ${id}`);
    }
    this.categories.delete(id);
  }

  // Playlist methods
  async getPlaylists(): Promise<Playlist[]> {
    return Array.from(this.playlists.values());
  }

  async updatePlaylist(id: number, playlistUpdate: Partial<InsertPlaylist>): Promise<Playlist> {
    const existingPlaylist = this.playlists.get(id);
    if (!existingPlaylist) {
      throw new Error(`Playlist not found: ${id}`);
    }
    
    const updatedPlaylist: Playlist = { 
      ...existingPlaylist, 
      ...playlistUpdate,
      // Ensure nullable fields are handled properly
      description: playlistUpdate.description !== undefined ? playlistUpdate.description : existingPlaylist.description,
      isFeatured: playlistUpdate.isFeatured !== undefined ? playlistUpdate.isFeatured : existingPlaylist.isFeatured
    };
    this.playlists.set(id, updatedPlaylist);
    return updatedPlaylist;
  }

  async deletePlaylist(id: number): Promise<void> {
    if (!this.playlists.has(id)) {
      throw new Error(`Playlist not found: ${id}`);
    }
    
    // Also remove related affirmations, favorites, and recent plays
    Array.from(this.affirmations.entries()).forEach(([affirmationId, affirmation]) => {
      if (affirmation.playlistId === id) {
        this.affirmations.delete(affirmationId);
      }
    });
    
    Array.from(this.userFavorites.entries()).forEach(([favoriteId, favorite]) => {
      if (favorite.playlistId === id) {
        this.userFavorites.delete(favoriteId);
      }
    });
    
    Array.from(this.recentPlays.entries()).forEach(([recentPlayId, recentPlay]) => {
      if (recentPlay.playlistId === id) {
        this.recentPlays.delete(recentPlayId);
      }
    });
    
    this.playlists.delete(id);
  }

  async getPlaylistsByCategory(categoryId: number): Promise<Playlist[]> {
    return Array.from(this.playlists.values()).filter(
      (playlist) => playlist.categoryId === categoryId
    );
  }

  async getFeaturedPlaylists(): Promise<Playlist[]> {
    return Array.from(this.playlists.values()).filter(
      (playlist) => playlist.isFeatured
    );
  }

  async getPlaylist(id: number): Promise<Playlist | undefined> {
    return this.playlists.get(id);
  }

  async createPlaylist(playlist: InsertPlaylist): Promise<Playlist> {
    const id = this.playlistIdCounter++;
    const createdAt = new Date();
    // Ensure nullable fields are explicitly set to null if undefined
    const newPlaylist: Playlist = { 
      ...playlist, 
      id, 
      createdAt,
      description: playlist.description || null,
      isFeatured: playlist.isFeatured || false
    };
    this.playlists.set(id, newPlaylist);
    return newPlaylist;
  }

  // Affirmation methods
  async getAffirmationsByPlaylist(playlistId: number): Promise<Affirmation[]> {
    return Array.from(this.affirmations.values()).filter(
      (affirmation) => affirmation.playlistId === playlistId
    );
  }

  async getAffirmation(id: number): Promise<Affirmation | undefined> {
    return this.affirmations.get(id);
  }

  async createAffirmation(affirmation: InsertAffirmation): Promise<Affirmation> {
    const id = this.affirmationIdCounter++;
    const newAffirmation: Affirmation = { ...affirmation, id };
    this.affirmations.set(id, newAffirmation);
    return newAffirmation;
  }

  // Background Music methods
  async getBackgroundMusics(): Promise<BackgroundMusic[]> {
    return Array.from(this.backgroundMusics.values());
  }

  async getBackgroundMusicsByCategory(category: string): Promise<BackgroundMusic[]> {
    return Array.from(this.backgroundMusics.values()).filter(
      (music) => music.category === category
    );
  }

  async getBackgroundMusic(id: number): Promise<BackgroundMusic | undefined> {
    return this.backgroundMusics.get(id);
  }

  async createBackgroundMusic(music: InsertBackgroundMusic): Promise<BackgroundMusic> {
    const id = this.backgroundMusicIdCounter++;
    const newMusic: BackgroundMusic = { ...music, id };
    this.backgroundMusics.set(id, newMusic);
    return newMusic;
  }

  // User Favorites methods
  async getUserFavorites(userId: number): Promise<Playlist[]> {
    const favorites = Array.from(this.userFavorites.values()).filter(
      (favorite) => favorite.userId === userId
    );
    
    return favorites.map(favorite => {
      const playlist = this.playlists.get(favorite.playlistId);
      if (!playlist) throw new Error(`Playlist not found: ${favorite.playlistId}`);
      return playlist;
    });
  }

  async addUserFavorite(favorite: InsertUserFavorite): Promise<UserFavorite> {
    const id = this.userFavoriteIdCounter++;
    const newFavorite: UserFavorite = { ...favorite, id };
    this.userFavorites.set(id, newFavorite);
    return newFavorite;
  }

  async removeUserFavorite(userId: number, playlistId: number): Promise<void> {
    const favoriteEntry = Array.from(this.userFavorites.entries()).find(
      ([_, favorite]) => favorite.userId === userId && favorite.playlistId === playlistId
    );
    
    if (favoriteEntry) {
      this.userFavorites.delete(favoriteEntry[0]);
    }
  }

  async isPlaylistFavorited(userId: number, playlistId: number): Promise<boolean> {
    return Array.from(this.userFavorites.values()).some(
      (favorite) => favorite.userId === userId && favorite.playlistId === playlistId
    );
  }

  // Recent Plays methods
  async getRecentPlays(userId: number): Promise<{ playlist: Playlist; playedAt: Date }[]> {
    const recentPlays = Array.from(this.recentPlays.values())
      .filter((play) => play.userId === userId)
      .filter((play) => play.playedAt !== null)
      .sort((a, b) => {
        // Safe check for null values in case they appear
        const aTime = a.playedAt ? a.playedAt.getTime() : 0;
        const bTime = b.playedAt ? b.playedAt.getTime() : 0;
        return bTime - aTime;
      });
    
    return recentPlays.map(play => {
      const playlist = this.playlists.get(play.playlistId);
      if (!playlist) throw new Error(`Playlist not found: ${play.playlistId}`);
      // We know playedAt is not null due to the filter above
      return { playlist, playedAt: play.playedAt as Date };
    });
  }

  async addRecentPlay(recentPlay: InsertRecentPlay): Promise<RecentPlay> {
    const id = this.recentPlayIdCounter++;
    const playedAt = new Date();
    const newRecentPlay: RecentPlay = { ...recentPlay, id, playedAt };
    this.recentPlays.set(id, newRecentPlay);
    return newRecentPlay;
  }

  // Seed data for the application
  private seedData() {
    // Seed categories
    const categories: InsertCategory[] = [
      { name: "Self-Love", icon: "smile", color: "#8F7EF7" },
      { name: "Wealth", icon: "money", color: "#8BD3DD" },
      { name: "Health", icon: "heart", color: "#FFB17A" },
      { name: "Relationships", icon: "group", color: "#4CAF50" },
      { name: "Success", icon: "trophy", color: "#6D5AE6" },
      { name: "Gratitude", icon: "leaf", color: "#A9E2E9" }
    ];
    
    categories.forEach(category => this.createCategory(category));

    // Seed playlists
    const playlists: InsertPlaylist[] = [
      {
        title: "Morning Confidence Boost",
        description: "Start your day with positive energy",
        duration: 900, // 15 min
        affirmationCount: 24,
        coverGradientStart: "#6D5AE6",
        coverGradientEnd: "#8BD3DD",
        icon: "podcast",
        categoryId: 1,
        isFeatured: true
      },
      {
        title: "Daily Confidence Boost",
        description: "Quick confidence affirmations",
        duration: 900, // 15 min
        affirmationCount: 24,
        coverGradientStart: "#8F7EF7",
        coverGradientEnd: "#6D5AE6",
        icon: "podcast",
        categoryId: 1,
        isFeatured: false
      },
      {
        title: "Sleep & Deep Relaxation",
        description: "Peaceful night affirmations",
        duration: 1800, // 30 min
        affirmationCount: 18,
        coverGradientStart: "#8BD3DD",
        coverGradientEnd: "#8F7EF7",
        icon: "podcast",
        categoryId: 3,
        isFeatured: false
      },
      {
        title: "Abundance & Prosperity",
        description: "Attract wealth and abundance",
        duration: 1200, // 20 min
        affirmationCount: 32,
        coverGradientStart: "#FFB17A",
        coverGradientEnd: "#8BD3DD",
        icon: "podcast",
        categoryId: 2,
        isFeatured: false
      },
      {
        title: "Healing & Self-Care",
        description: "Nurture your mind and body",
        duration: 1500, // 25 min
        affirmationCount: 28,
        coverGradientStart: "#6D5AE6",
        coverGradientEnd: "#FFB17A",
        icon: "podcast",
        categoryId: 3,
        isFeatured: false
      },
      {
        title: "Morning Positivity",
        description: "Start your day with positive energy",
        duration: 720, // 12 min
        affirmationCount: 20,
        coverGradientStart: "#8F7EF7",
        coverGradientEnd: "#6D5AE6",
        icon: "headphone",
        categoryId: 1,
        isFeatured: false
      },
      {
        title: "Focus & Productivity",
        description: "Enhance your work performance",
        duration: 1200, // 20 min
        affirmationCount: 25,
        coverGradientStart: "#8BD3DD",
        coverGradientEnd: "#6D5AE6",
        icon: "headphone",
        categoryId: 5,
        isFeatured: false
      },
      {
        title: "Evening Calm",
        description: "Wind down after a long day",
        duration: 900, // 15 min
        affirmationCount: 22,
        coverGradientStart: "#FFB17A",
        coverGradientEnd: "#8BD3DD",
        icon: "headphone",
        categoryId: 6,
        isFeatured: false
      }
    ];
    
    playlists.forEach(playlist => this.createPlaylist(playlist));

    // Seed affirmations for the Morning Confidence Boost playlist
    const affirmations: InsertAffirmation[] = [
      {
        text: "I am confident and capable in everything I do",
        audioUrl: "/api/audio/affirmations/confidence-1.mp3",
        duration: 5,
        playlistId: 1
      },
      {
        text: "I believe in myself and my abilities",
        audioUrl: "/api/audio/affirmations/confidence-2.mp3",
        duration: 4,
        playlistId: 1
      },
      {
        text: "I am worthy of success and happiness",
        audioUrl: "/api/audio/affirmations/confidence-3.mp3",
        duration: 5,
        playlistId: 1
      },
      {
        text: "I am becoming stronger every day",
        audioUrl: "/api/audio/affirmations/confidence-4.mp3",
        duration: 4,
        playlistId: 1
      },
      {
        text: "I am in control of my thoughts and emotions",
        audioUrl: "/api/audio/affirmations/confidence-5.mp3",
        duration: 6,
        playlistId: 1
      }
    ];
    
    affirmations.forEach(affirmation => this.createAffirmation(affirmation));

    // Seed background music
    const backgroundMusics: InsertBackgroundMusic[] = [
      {
        name: "Gentle Piano",
        audioUrl: "/api/audio/background/gentle-piano.mp3",
        category: "Relax"
      },
      {
        name: "Ocean Waves",
        audioUrl: "/api/audio/background/ocean-waves.mp3",
        category: "Nature"
      },
      {
        name: "Meditation Flute",
        audioUrl: "/api/audio/background/meditation-flute.mp3",
        category: "Focus"
      },
      {
        name: "Night Ambience",
        audioUrl: "/api/audio/background/night-ambience.mp3",
        category: "Sleep"
      },
      {
        name: "Binaural Focus",
        audioUrl: "/api/audio/background/binaural-focus.mp3",
        category: "Binaural Beats"
      }
    ];
    
    backgroundMusics.forEach(music => this.createBackgroundMusic(music));

    // Create a default user
    this.createUser({
      username: "guest",
      password: "guest",
      name: "Guest User",
      email: "guest@example.com",
      avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80"
    });

    // Add some favorites for the guest user
    this.addUserFavorite({
      userId: 1,
      playlistId: 1
    });
    
    this.addUserFavorite({
      userId: 1,
      playlistId: 3
    });

    // Add some recent plays for the guest user
    this.addRecentPlay({
      userId: 1,
      playlistId: 6
    });
    
    this.addRecentPlay({
      userId: 1,
      playlistId: 7
    });
    
    this.addRecentPlay({
      userId: 1,
      playlistId: 8
    });
  }
}

import { db } from "./db";
import { eq, and, desc, count } from "drizzle-orm";

/**
 * DatabaseStorage implementation of IStorage
 * This class implements all the methods in the IStorage interface
 * using Drizzle ORM to interact with a PostgreSQL database
 */
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

   async getAdminUsers(filters?: AdminUserFilters): Promise<AdminUser[]> {
    let query = db.select().from(users);

    // Apply search filter
    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      query = query.where(
        or(
          like(users.name, searchTerm),
          like(users.email, searchTerm),
          like(users.username, searchTerm)
        )
      );
    }

    const userList = await query;

    return userList.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      status: (user as any).status || "active", // Add status field to your schema
      subscriptionStatus: user.id === 1 ? "premium" : "free", // Mock - implement subscription table
      joinedAt: user.createdAt,
      lastLogin: user.createdAt, // Mock - implement last login tracking
      avatarUrl: user.avatarUrl
    }));
  }

  async getAdminUser(id: number): Promise<AdminUser | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (!user) return undefined;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      status: (user as any).status || "active",
      subscriptionStatus: user.id === 1 ? "premium" : "free",
      joinedAt: user.createdAt,
      lastLogin: user.createdAt,
      avatarUrl: user.avatarUrl
    };
  }

  async updateAdminUser(id: number, updates: UpdateUserRequest): Promise<AdminUser> {
    const [updatedUser] = await db
      .update(users)
      .set({
        name: updates.name,
        email: updates.email,
        // Add status field to your schema: status: updates.status
      })
      .where(eq(users.id, id))
      .returning();

    if (!updatedUser) {
      throw new Error(`User not found: ${id}`);
    }

    return this.getAdminUser(id) as Promise<AdminUser>;
  }

  async createAdminUser(userReq: CreateUserRequest): Promise<AdminUser> {
    const newUser = await this.createUser({
      username: userReq.username,
      password: userReq.password,
      name: userReq.name,
      email: userReq.email
    });

    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      username: newUser.username,
      status: "active",
      subscriptionStatus: "free",
      joinedAt: newUser.createdAt,
      lastLogin: null,
      avatarUrl: newUser.avatarUrl
    };
  }

  async deleteAdminUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getUsersCount(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(users);
    return result.count;
  }

   async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Get basic counts
      const [
        userCount,
        trackCount,
        playlistCount,
        playCount
      ] = await Promise.all([
        db.select({ count: count() }).from(users),
        db.select({ count: count() }).from(affirmations),
        db.select({ count: count() }).from(playlists),
        db.select({ count: count() }).from(recentPlays)
      ]);

      const totalUsers = userCount[0].count;
      const totalTracks = trackCount[0].count;
      const totalPlaylists = playlistCount[0].count;
      const totalPlays = playCount[0].count;

      // Mock subscribers calculation (you might want to add a subscription table)
      const totalSubscribers = Math.floor(totalUsers * 0.15);

      // Get user growth data (last 6 months)
      // Note: This is a simplified version. In production, you'd want to store user registration dates
      // and query actual historical data
      const now = new Date();
      const userGrowth = Array.from({ length: 6 }, (_, i) => {
        const monthsAgo = 5 - i;
        const date = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
        const monthName = date.toLocaleDateString('en-US', { month: 'short' });
        const users = Math.floor(totalUsers * (0.5 + (i * 0.1)));
        return { name: monthName, users };
      });

      // Mock listening data for the past week
      const listeningData = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const minutes = Math.floor(Math.random() * 500) + 200;
        return { name: dayName, minutes };
      });

      // Subscription distribution
      const subscriptionData = [
        { name: 'Free', value: totalUsers - totalSubscribers },
        { name: 'Premium', value: totalSubscribers }
      ];

      // Get category popularity
      const categoryPlaylistCounts = await db
        .select({
          categoryName: categories.name,
          playlistCount: count(playlists.id)
        })
        .from(categories)
        .leftJoin(playlists, eq(categories.id, playlists.categoryId))
        .groupBy(categories.id, categories.name);

      const categoryData = categoryPlaylistCounts.map(item => ({
        name: item.categoryName,
        value: item.playlistCount
      }));

      return {
        totalUsers,
        totalTracks,
        totalSubscribers,
        totalPlays,
        userGrowthPercent: 12.5, // You'd calculate this from actual historical data
        newTracksThisWeek: 3, // You'd query tracks created in the last week
        conversionRate: totalUsers > 0 ? Math.round((totalSubscribers / totalUsers) * 100) : 0,
        playsGrowthPercent: 8.3, // You'd calculate this from historical play data
        userGrowth,
        listeningData,
        subscriptionData,
        categoryData
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Ensure all fields are handled properly with null values for optional fields
    const userToInsert = {
      ...insertUser,
      name: insertUser.name ?? null,
      email: insertUser.email ?? null,
      avatarUrl: insertUser.avatarUrl ?? null
    };
    
    const [user] = await db.insert(users).values(userToInsert).returning();
    return user;
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return db.select().from(categories);
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async updateCategory(id: number, category: UpdateCategory): Promise<Category> {
    const [updatedCategory] = await db.update(categories).set(category).where(eq(categories.id, id)).returning();
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  // Playlist methods
  async getPlaylists(): Promise<Playlist[]> {
    return db.select().from(playlists);
  }

  async getPlaylistsByCategory(categoryId: number): Promise<Playlist[]> {
    return db.select().from(playlists).where(eq(playlists.categoryId, categoryId));
  }

  async getFeaturedPlaylists(): Promise<Playlist[]> {
    return db.select().from(playlists).where(eq(playlists.isFeatured, true));
  }

  async getPlaylist(id: number): Promise<Playlist | undefined> {
    const [playlist] = await db.select().from(playlists).where(eq(playlists.id, id));
    return playlist;
  }

  async createPlaylist(playlist: InsertPlaylist): Promise<Playlist> {
    // Ensure all nullable fields are properly handled
    const playlistToInsert = {
      ...playlist,
      description: playlist.description ?? null,
      isFeatured: playlist.isFeatured ?? false
    };
    
    const [newPlaylist] = await db.insert(playlists).values(playlistToInsert).returning();
    return newPlaylist;
  }

  async updatePlaylist(id: number, playlist: UpdatePlaylist): Promise<Playlist> {
    const [updatedPlaylist] = await db.update(playlists).set(playlist).where(eq(playlists.id, id)).returning();
    return updatedPlaylist;
  }

  async deletePlaylist(id: number): Promise<void> {
    await db.delete(playlists).where(eq(playlists.id, id));
  }

  // Affirmation methods
  async getAffirmationsByPlaylist(playlistId: number): Promise<Affirmation[]> {
    return db.select().from(affirmations).where(eq(affirmations.playlistId, playlistId));
  }

  async getAffirmation(id: number): Promise<Affirmation | undefined> {
    const [affirmation] = await db.select().from(affirmations).where(eq(affirmations.id, id));
    return affirmation;
  }

  async createAffirmation(affirmation: InsertAffirmation): Promise<Affirmation> {
    const [newAffirmation] = await db.insert(affirmations).values(affirmation).returning();
    return newAffirmation;
  }

  // Background Music methods
  async getBackgroundMusics(): Promise<BackgroundMusic[]> {
    return db.select().from(backgroundMusics);
  }

  async getBackgroundMusicsByCategory(category: string): Promise<BackgroundMusic[]> {
    return db.select().from(backgroundMusics).where(eq(backgroundMusics.category, category));
  }

  async getBackgroundMusic(id: number): Promise<BackgroundMusic | undefined> {
    const [music] = await db.select().from(backgroundMusics).where(eq(backgroundMusics.id, id));
    return music;
  }

  async createBackgroundMusic(music: InsertBackgroundMusic): Promise<BackgroundMusic> {
    const [newMusic] = await db.insert(backgroundMusics).values(music).returning();
    return newMusic;
  }

  // User Favorites methods
  async getUserFavorites(userId: number): Promise<Playlist[]> {
    const favoritesWithPlaylists = await db
      .select({
        playlist: playlists
      })
      .from(userFavorites)
      .innerJoin(playlists, eq(userFavorites.playlistId, playlists.id))
      .where(eq(userFavorites.userId, userId));
    
    return favoritesWithPlaylists.map(item => item.playlist);
  }

  async addUserFavorite(favorite: InsertUserFavorite): Promise<UserFavorite> {
    const [newFavorite] = await db.insert(userFavorites).values(favorite).returning();
    return newFavorite;
  }

  async removeUserFavorite(userId: number, playlistId: number): Promise<void> {
    await db.delete(userFavorites)
      .where(
        and(
          eq(userFavorites.userId, userId),
          eq(userFavorites.playlistId, playlistId)
        )
      );
  }

  async isPlaylistFavorited(userId: number, playlistId: number): Promise<boolean> {
    const [favorite] = await db.select()
      .from(userFavorites)
      .where(
        and(
          eq(userFavorites.userId, userId),
          eq(userFavorites.playlistId, playlistId)
        )
      );
    
    return !!favorite;
  }

  // Recent Plays methods
  async getRecentPlays(userId: number): Promise<{ playlist: Playlist; playedAt: Date }[]> {
    const recentPlaysWithPlaylists = await db
      .select({
        playlist: playlists,
        playedAt: recentPlays.playedAt
      })
      .from(recentPlays)
      .innerJoin(playlists, eq(recentPlays.playlistId, playlists.id))
      .where(eq(recentPlays.userId, userId))
      .orderBy(desc(recentPlays.playedAt));
    
    // Make sure to handle null playedAt values and convert to actual Date objects
    return recentPlaysWithPlaylists
      .filter(item => item.playedAt !== null)
      .map(item => ({ 
        playlist: item.playlist, 
        playedAt: item.playedAt as Date 
      }));
  }

  async addRecentPlay(recentPlay: InsertRecentPlay): Promise<RecentPlay> {
    const [newRecentPlay] = await db.insert(recentPlays).values(recentPlay).returning();
    return newRecentPlay;
  }

  // Method to seed initial data to the database
  async seedInitialData() {
    // Check if we already have data
    const categoryCount = await db.select({ count: count() }).from(categories);
    if (categoryCount[0].count > 0) return;
    
    // Seed categories
    const categoryData: InsertCategory[] = [
      { name: "Self-Love", icon: "smile", color: "#8F7EF7" },
      { name: "Wealth", icon: "money", color: "#8BD3DD" },
      { name: "Health", icon: "heart", color: "#FFB17A" },
      { name: "Relationships", icon: "group", color: "#4CAF50" },
      { name: "Success", icon: "trophy", color: "#6D5AE6" },
      { name: "Gratitude", icon: "leaf", color: "#A9E2E9" }
    ];
    
    const seededCategories = await db.insert(categories).values(categoryData).returning();
    
    // Seed playlists
    const playlistData: InsertPlaylist[] = [
      {
        title: "Morning Confidence Boost",
        description: "Start your day with positive energy",
        duration: 900, // 15 min
        affirmationCount: 24,
        coverGradientStart: "#6D5AE6",
        coverGradientEnd: "#8BD3DD",
        icon: "podcast",
        categoryId: 1,
        isFeatured: true
      },
      {
        title: "Daily Confidence Boost",
        description: "Quick confidence affirmations",
        duration: 900, // 15 min
        affirmationCount: 24,
        coverGradientStart: "#8F7EF7",
        coverGradientEnd: "#6D5AE6",
        icon: "podcast",
        categoryId: 1,
        isFeatured: false
      },
      // Add more playlists as needed...
    ];
    
    const seededPlaylists = await db.insert(playlists).values(playlistData).returning();
    
    // Seed affirmations
    const affirmationData: InsertAffirmation[] = [
      {
        text: "I am confident and capable in everything I do",
        audioUrl: "/api/audio/affirmations/confidence-1.mp3",
        duration: 5,
        playlistId: 1
      },
      {
        text: "I believe in myself and my abilities",
        audioUrl: "/api/audio/affirmations/confidence-2.mp3",
        duration: 4,
        playlistId: 1
      },
      // Add more affirmations as needed...
    ];
    
    await db.insert(affirmations).values(affirmationData);
    
    // Seed background music
    const musicData: InsertBackgroundMusic[] = [
      {
        name: "Gentle Piano",
        audioUrl: "/api/audio/background/gentle-piano.mp3",
        category: "Relax"
      },
      {
        name: "Ocean Waves",
        audioUrl: "/api/audio/background/ocean-waves.mp3",
        category: "Nature"
      },
      // Add more background music as needed...
    ];
    
    await db.insert(backgroundMusics).values(musicData);
    
    // Create a default user
    const userData: InsertUser = {
      username: "guest",
      password: "guest",
      name: "Guest User",
      email: "guest@example.com",
      avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80"
    };
    
    const [user] = await db.insert(users).values(userData).returning();
    
    // Add favorites
    // Only add favorites for playlists that actually exist
    const favoriteData: InsertUserFavorite[] = [
      { userId: user.id, playlistId: 1 }
    ];
    
    await db.insert(userFavorites).values(favoriteData);
    
    // Add recent plays
    const recentPlayData: InsertRecentPlay[] = [
      { userId: user.id, playlistId: 1 },
      { userId: user.id, playlistId: 2 }
    ];
    
    await db.insert(recentPlays).values(recentPlayData);
  }
}

// Export an instance of DatabaseStorage instead of MemStorage
export const storage = new DatabaseStorage();
