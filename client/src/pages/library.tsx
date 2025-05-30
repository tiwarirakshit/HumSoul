import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, PlayCircle, Clock, Headphones } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDuration } from "@/lib/audio";
import { useAudio } from "@/hooks/use-audio";
import { apiRequest } from "@/lib/queryClient";

export default function Library() {
  const { playPlaylist } = useAudio();
  
  // Query favorites
  const { data: favorites, isLoading: favoritesLoading } = useQuery({
    queryKey: ['/api/favorites', { userId: 1 }],
  });
  
  // Query recent plays
  const { data: recentPlays, isLoading: recentPlaysLoading } = useQuery({
    queryKey: ['/api/recent-plays', { userId: 1 }],
  });
  
  // Get category names for playlists
  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
  });
  
  const categoryMap = categories
    ? new Map(categories.map((c: any) => [c.id, c.name]))
    : new Map();
  
  const handlePlay = async (playlistId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      // Fetch the playlist
      const playlistRes = await fetch(`/api/playlists/${playlistId}`);
      const playlist = await playlistRes.json();
      
      // Fetch the affirmations
      const affirmationsRes = await fetch(`/api/affirmations?playlistId=${playlistId}`);
      const affirmations = await affirmationsRes.json();
      
      // Add to recent plays
      await apiRequest(
        'POST',
        '/api/recent-plays',
        { userId: 1, playlistId }
      );
      
      // Play the playlist
      playPlaylist(playlist, affirmations);
    } catch (error) {
      console.error('Error playing playlist:', error);
    }
  };
  
  return (
    <div className="py-4">
      <h1 className="text-2xl font-semibold mb-6">Your Library</h1>
      
      <Tabs defaultValue="favorites">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="favorites" className="flex-1">Favorites</TabsTrigger>
          <TabsTrigger value="recent" className="flex-1">Recent</TabsTrigger>
        </TabsList>
        
        <TabsContent value="favorites">
          {favoritesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white dark:bg-dark-light rounded-lg p-3 flex items-center shadow-sm">
                  <Skeleton className="w-12 h-12 rounded-md flex-shrink-0" />
                  <div className="ml-3 flex-1">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
                </div>
              ))}
            </div>
          ) : favorites && favorites.length > 0 ? (
            <div className="space-y-3">
              {favorites.map((playlist: any) => (
                <Link key={playlist.id} href={`/playlist/${playlist.id}`}>
                  <div className="bg-white dark:bg-dark-light rounded-lg p-3 flex items-center shadow-sm cursor-pointer">
                    <div 
                      className="w-12 h-12 rounded-md flex items-center justify-center text-white flex-shrink-0"
                      style={{ backgroundColor: playlist.coverGradientStart }}
                    >
                      <Heart className="h-5 w-5 fill-white" />
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <h3 className="font-medium text-sm line-clamp-1">{playlist.title}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {categoryMap.get(playlist.categoryId) || 'General'} • {formatDuration(playlist.duration)}
                      </p>
                    </div>
                    <button 
                      className="ml-2 w-9 h-9 rounded-full bg-light dark:bg-dark-lighter flex items-center justify-center flex-shrink-0"
                      onClick={(e) => handlePlay(playlist.id, e)}
                    >
                      <PlayCircle className="h-5 w-5 text-primary dark:text-primary-light" />
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <Heart className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <h3 className="text-lg font-medium mb-2">No favorites yet</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Add playlists to your favorites by tapping the heart icon
              </p>
              <Link href="/discover">
                <a className="mt-6 inline-block px-6 py-2 bg-primary text-white rounded-full font-medium">
                  Discover Playlists
                </a>
              </Link>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="recent">
          {recentPlaysLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white dark:bg-dark-light rounded-lg p-3 flex items-center shadow-sm">
                  <Skeleton className="w-12 h-12 rounded-md flex-shrink-0" />
                  <div className="ml-3 flex-1">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
                </div>
              ))}
            </div>
          ) : recentPlays && recentPlays.length > 0 ? (
            <div className="space-y-3">
              {recentPlays.map((play: any) => (
                <Link key={play.playlist.id} href={`/playlist/${play.playlist.id}`}>
                  <div className="bg-white dark:bg-dark-light rounded-lg p-3 flex items-center shadow-sm cursor-pointer">
                    <div 
                      className="w-12 h-12 rounded-md flex items-center justify-center text-white flex-shrink-0"
                      style={{ backgroundColor: play.playlist.coverGradientStart }}
                    >
                      <Headphones className="h-5 w-5" />
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <h3 className="font-medium text-sm line-clamp-1">{play.playlist.title}</h3>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        <span>{categoryMap.get(play.playlist.categoryId) || 'General'}</span>
                        <span className="mx-1">•</span>
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(play.playedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <button 
                      className="ml-2 w-9 h-9 rounded-full bg-light dark:bg-dark-lighter flex items-center justify-center flex-shrink-0"
                      onClick={(e) => handlePlay(play.playlist.id, e)}
                    >
                      <PlayCircle className="h-5 w-5 text-primary dark:text-primary-light" />
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <Clock className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <h3 className="text-lg font-medium mb-2">No recent plays</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Start listening to affirmations to see your history
              </p>
              <Link href="/">
                <a className="mt-6 inline-block px-6 py-2 bg-primary text-white rounded-full font-medium">
                  Explore Affirmations
                </a>
              </Link>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
