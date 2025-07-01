import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Play, Headphones } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDuration } from "@/lib/audio";
import { useAudio } from "@/hooks/use-audio";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

export default function RecentPlaysSection() {
  const { playPlaylist } = useAudio();
  
  const { backendUser, loading: authLoading } = useAuth();
  let userId = backendUser?.id;
  if (!userId) {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const parsed = JSON.parse(userStr);
        if (parsed && parsed.id && parsed.id !== 1) {
          userId = parsed.id;
        }
      }
    } catch {}
  }
  if (!userId || userId === 1) {
    userId = undefined;
  }
  
  // Query recent plays
  const { data: recentPlaysRaw, isLoading } = useQuery({
    queryKey: [`/api/recent-plays?userId=${userId}`, { userId }],
    enabled: !!userId && !authLoading,
  });
  const recentPlays = Array.isArray((recentPlaysRaw as any)?.data)
    ? (recentPlaysRaw as any).data
    : Array.isArray(recentPlaysRaw)
      ? recentPlaysRaw as any[]
      : [];
  
  // Move this hook to the top level
  const { data: categoriesRaw } = useQuery({
    queryKey: ['/api/categories'],
  });
  const categories = Array.isArray(categoriesRaw) ? categoriesRaw : [];
  
  const queryClient = useQueryClient();
  
  const handlePlay = async (playlistId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userId) return;
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
        { userId, playlistId }
      );
      
      // Refetch recent plays
      queryClient.invalidateQueries({ queryKey: ['/api/recent-plays'] });
      
      // Play the playlist
      playPlaylist(playlist, affirmations);
    } catch (error) {
      console.error('Error playing playlist:', error);
    }
  };
  
  if (isLoading) {
    return (
      <section className="py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-medium">Recent Plays</h2>
          <span className="text-primary dark:text-primary-light text-sm font-medium">See All</span>
        </div>
        
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
      </section>
    );
  }
  
  if (!recentPlays || recentPlays.length === 0) {
    return (
      <section className="py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-medium">Recent Plays</h2>
          <span className="text-primary dark:text-primary-light text-sm font-medium">See All</span>
        </div>
        
        <p className="text-center text-gray-500 dark:text-gray-400 my-8">
          No recent plays yet. Start listening to affirmations!
        </p>
      </section>
    );
  }
  
  // Get category names for playlists
  const categoryMap = categories.length
    ? new Map(categories.map((c: any) => [c.id, c.name]))
    : new Map();
  
  return (
    <section className="py-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-medium">Recent Plays</h2>
        <Link href="/library" className="text-primary dark:text-primary-light text-sm font-medium">See All</Link>
      </div>
      
      <div className="space-y-3">
        {recentPlays?.slice(0, 3).map((play: any) => (
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
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {categoryMap.get(play.playlist.categoryId) || 'General'} • {formatDuration(play.playlist.duration)}
                </p>
              </div>
              <button 
                className="ml-2 w-9 h-9 rounded-full bg-light dark:bg-dark-lighter flex items-center justify-center flex-shrink-0"
                onClick={(e) => handlePlay(play.playlist.id, e)}
              >
                <Play className="h-5 w-5 text-primary dark:text-primary-light" />
              </button>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
