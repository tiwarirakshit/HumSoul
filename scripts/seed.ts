import { db } from "../server/db";
import { categories, playlists, affirmations, backgroundMusics } from "../shared/schema";

async function seed() {
  console.log("🌱 Starting to seed database...");

  try {
    // Add categories
    console.log("Adding categories...");
    const [confidence, selfLove, abundance, happiness, health, motivation] = await db.insert(categories).values([
      { name: "Confidence", icon: "✨", color: "#8B5CF6" },
      { name: "Self Love", icon: "❤️", color: "#EC4899" },
      { name: "Abundance", icon: "💫", color: "#F59E0B" },
      { name: "Happiness", icon: "😊", color: "#10B981" },
      { name: "Health", icon: "🌿", color: "#3B82F6" },
      { name: "Motivation", icon: "🔥", color: "#EF4444" }
    ]).returning();

    // Add playlists
    console.log("Adding playlists...");
    const [confidencePlaylist, selfLovePlaylist] = await db.insert(playlists).values([
      {
        title: "Daily Confidence Boost",
        description: "Start your day with powerful confidence affirmations",
        duration: 600, // 10 minutes
        affirmationCount: 10,
        coverGradientStart: "#8B5CF6",
        coverGradientEnd: "#6366F1",
        icon: "✨",
        categoryId: confidence.id,
        isFeatured: true
      },
      {
        title: "Self Love Journey",
        description: "Nurture your relationship with yourself",
        duration: 900, // 15 minutes
        affirmationCount: 12,
        coverGradientStart: "#EC4899",
        coverGradientEnd: "#F472B6",
        icon: "❤️",
        categoryId: selfLove.id,
        isFeatured: true
      }
    ]).returning();

    // Add affirmations
    console.log("Adding affirmations...");
    await db.insert(affirmations).values([
      // Confidence affirmations
      {
        text: "I am confident and capable in everything I do",
        audioUrl: "/audio/affirmations/confidence-1.mp3",
        duration: 60,
        playlistId: confidencePlaylist.id
      },
      {
        text: "I trust in my abilities and inner wisdom",
        audioUrl: "/audio/affirmations/confidence-2.mp3",
        duration: 60,
        playlistId: confidencePlaylist.id
      },
      {
        text: "I radiate confidence, self-respect, and inner harmony",
        audioUrl: "/audio/affirmations/confidence-3.mp3",
        duration: 60,
        playlistId: confidencePlaylist.id
      },
      // Self Love affirmations
      {
        text: "I am worthy of love, respect, and happiness",
        audioUrl: "/audio/affirmations/self-love-1.mp3",
        duration: 75,
        playlistId: selfLovePlaylist.id
      },
      {
        text: "I accept myself fully for who I am",
        audioUrl: "/audio/affirmations/self-love-2.mp3",
        duration: 75,
        playlistId: selfLovePlaylist.id
      },
      {
        text: "I am enough, just as I am",
        audioUrl: "/audio/affirmations/self-love-3.mp3",
        duration: 75,
        playlistId: selfLovePlaylist.id
      }
    ]);

    // Add background music
    console.log("Adding background music...");
    await db.insert(backgroundMusics).values([
      {
        name: "Calm Meditation",
        audioUrl: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=empty-mind-118973.mp3",
        category: "Relax"
      },
      {
        name: "Peaceful Nature",
        audioUrl: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0c6ff1ac9.mp3?filename=forest-with-small-river-birds-and-nature-field-recording-6735.mp3",
        category: "Nature"
      },
      {
        name: "Deep Focus",
        audioUrl: "https://cdn.pixabay.com/download/audio/2022/08/02/audio_884fe92c21.mp3?filename=lifelike-126735.mp3",
        category: "Focus"
      },
      {
        name: "Gentle Rain",
        audioUrl: "https://cdn.pixabay.com/download/audio/2021/08/09/audio_88447e769f.mp3?filename=rain-and-thunder-16705.mp3",
        category: "Nature"
      }
    ]);

    console.log("✅ Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }

  process.exit(0);
}

seed(); 