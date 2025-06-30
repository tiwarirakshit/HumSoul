import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAudio } from "@/hooks/use-audio";
import { Play, Heart, Pause } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { Playlist } from "@/context/audio-context";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

export default function FeaturedSection() {
  const { playPlaylist, isPlaying } = useAudio();
  const [isFavorited, setIsFavorited] = useState(false);
  const { backendUser, loading: authLoading } = useAuth();
  const userId = backendUser?.id;

  // Query featured playlists
  const { data: featuredPlaylists, isLoading } = useQuery<Playlist[]>({
    queryKey: ['/api/playlists/featured'],
  });

  // Get the first featured playlist
  const featuredPlaylist = (featuredPlaylists as Playlist[])?.[0];

  useEffect(() => {
    if (!userId || !featuredPlaylist?.id) return;
    const checkFavorite = async () => {
      const res = await fetch(`/api/favorites/check?userId=${userId}&playlistId=${featuredPlaylist.id}`);
      const data = await res.json();
      setIsFavorited(data.isFavorited);
    };
    checkFavorite();
  }, [userId, featuredPlaylist?.id]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userId || !featuredPlaylist) return;

    try {
      if (isFavorited) {
        await apiRequest(
          'DELETE',
          `/api/favorites?userId=${userId}&playlistId=${featuredPlaylist.id}`
        );
      } else {
        await apiRequest(
          'POST',
          '/api/favorites',
          { userId, playlistId: featuredPlaylist.id }
        );
      }

      setIsFavorited(!isFavorited);
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handlePlayFeatured = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!userId || !featuredPlaylist) return;

    try {
      // Fetch the affirmations for the playlist
      const res = await fetch(`/api/affirmations?playlistId=${featuredPlaylist.id}`);
      const affirmations = await res.json();

      // Add to recent plays
      await apiRequest(
        'POST',
        '/api/recent-plays',
        { userId, playlistId: featuredPlaylist.id }
      );

      // Play the playlist
      playPlaylist(featuredPlaylist, affirmations);
    } catch (error) {
      console.error('Error playing featured playlist:', error);
    }
  };

  if (isLoading) {
    return (
      <section className="py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-medium">Featured Today</h2>
          <span className="text-primary dark:text-primary-light text-sm font-medium">See All</span>
        </div>

        <Skeleton className="h-[180px] w-full rounded-xl" />
      </section>
    );
  }

  if (!featuredPlaylist) {
    return (
      <section className="py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-medium">Featured Today</h2>
          <span className="text-primary dark:text-primary-light text-sm font-medium">See All</span>
        </div>

        <div className="rounded-xl bg-gray-100 dark:bg-dark-light p-6 text-center">
          <p>No featured playlist available</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-medium">Featured Today</h2>
        <Link href="/discover" className="text-primary dark:text-primary-light text-sm font-medium">
          See All
        </Link>
      </div>

      <Link href={`/playlist/${featuredPlaylist.id}`}>
        <div
          className="relative overflow-hidden rounded-xl p-6 text-white shadow-lg cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${featuredPlaylist.coverGradientStart}, ${featuredPlaylist.coverGradientEnd})`
          }}
        >
          <div className="relative z-10">
            <span className="bg-white bg-opacity-25 text-white text-xs px-3 py-1 rounded-full font-medium">
              Featured
            </span>
            <h3 className="text-2xl font-semibold mt-3">{featuredPlaylist.title}</h3>
            <p className="text-white text-opacity-90 mt-1">{featuredPlaylist.description}</p>

            <div className="flex items-center mt-4 space-x-3">
              <Button
                variant="default"
                className={`font-medium transition-all duration-200 ${isPlaying
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "bg-white text-primary hover:bg-primary hover:text-white"
                  }`}
                disabled={isPlaying}
                onClick={handlePlayFeatured}
              >
                {isPlaying ? (
                  <>
                    {/* <Pause className="h-4 w-4 mr-2" /> */}
                    <span>Playing</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    <span>Play</span>
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="bg-white bg-opacity-25 border-none text-white hover:bg-white hover:bg-opacity-40"
                onClick={toggleFavorite}
              >
                <Heart className={`h-5 w-5 ${isFavorited ? 'fill-white' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-1/2 right-4 w-32 h-32 rounded-full bg-white opacity-10"></div>
          <div className="absolute bottom-0 right-24 w-20 h-20 rounded-full bg-white opacity-10"></div>
        </div>
      </Link>
    </section>
  );
}
