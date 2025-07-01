import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Heart, PlayCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDuration } from "@/lib/audio";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

export default function PlaylistsSection() {
  const { backendUser, loading: authLoading } = useAuth();
  const userId = backendUser?.id;
  
  // Query all playlists
  const { data: playlists, isLoading } = useQuery({
    queryKey: ['/api/playlists'],
  });
  
  // Get favorited playlist IDs
  const { data: favorites = [] } = useQuery({
    queryKey: ['/api/favorites', { userId }],
    enabled: !!userId && !authLoading,
  });
  
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  
  // Debug log
  if (userId && playlists) {
    console.log('PlaylistsSection render', { userId, playlists, favorites, favoriteIds });
  }
  
  useEffect(() => {
    if (favorites && favoriteIds.size === 0) {
      setFavoriteIds(new Set(favorites.map((p: any) => p.id)));
    }
  }, [favorites, favoriteIds.size]);
  
  const toggleFavorite = async (playlistId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userId) return;
    try {
      if (favoriteIds.has(playlistId)) {
        await apiRequest(
          'DELETE', 
          `/api/favorites?userId=${userId}&playlistId=${playlistId}`
        );
        favoriteIds.delete(playlistId);
      } else {
        await apiRequest(
          'POST', 
          '/api/favorites', 
          { userId, playlistId }
        );
        favoriteIds.add(playlistId);
      }
      
      // Force update with a new Set
      setFavoriteIds(new Set(favoriteIds));
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };
  
  if (isLoading) {
    return (
      <section className="py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-medium">Popular Playlists</h2>
          <span className="text-primary dark:text-primary-light text-sm font-medium">View All</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white dark:bg-dark-light rounded-lg overflow-hidden shadow-sm">
              <Skeleton className="h-36 w-full" />
              <div className="p-3">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }
  
  if (!playlists || playlists.length === 0) {
    return (
      <section className="py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-medium">Popular Playlists</h2>
          <span className="text-primary dark:text-primary-light text-sm font-medium">View All</span>
        </div>
        
        <p className="text-center text-gray-500 dark:text-gray-400">No playlists available</p>
      </section>
    );
  }
  
  return (
    <section className="py-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-medium">Popular Playlists</h2>
        <Link href="/discover" className="text-primary dark:text-primary-light text-sm font-medium">
          View All
        </Link>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {playlists.slice(0, 4).map(playlist => (
          <Link key={playlist.id} href={`/playlist/${playlist.id}`}>
            <div className="bg-white dark:bg-dark-light rounded-lg overflow-hidden shadow-sm cursor-pointer">
              <div 
                className="h-36 relative overflow-hidden"
                style={{
                  background: `linear-gradient(to bottom right, ${playlist.coverGradientStart}, ${playlist.coverGradientEnd})`
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center opacity-25">
                  <i className={`bx bx-${playlist.icon} text-7xl text-white`}></i>
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-medium text-sm line-clamp-1">{playlist.title}</h3>
                
                <div className="flex items-center justify-between mt-2">
                  <button 
                    className="text-primary dark:text-primary-light"
                    onClick={(e) => toggleFavorite(playlist.id, e)}
                    disabled={!userId}
                  >
                    <Heart 
                      className={`h-5 w-5 ${favoriteIds.has(playlist.id) ? 'fill-primary text-primary' : ''}`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
