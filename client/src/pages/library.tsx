import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, PlayCircle, Clock, Headphones } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDuration } from "@/lib/audio";
import { useAudio } from "@/hooks/use-audio";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";

export default function Library() {
  console.log('Library component rendered');
  const { playPlaylist } = useAudio();
  const queryClient = useQueryClient();
  const { backendUser } = useAuth();
  let userId = backendUser?.id || localStorage.getItem('user')?.id;
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
  // If still not set, or is 1, set to undefined to avoid accidental queries
  if (!userId || userId === 1) {
    userId = undefined;
  }
  
  console.log('Library userId used for API calls:', userId);
  
  // Track active tab
  const [activeTab, setActiveTab] = useState('favorites');
  
  // Query favorites
  const { data: favoritesResp, refetch: refetchFavorites } = useQuery({
    queryKey: ['https://mpforestvillage.in/api/favorites', { userId }],
    queryFn: () => userId ? apiRequest('GET', `https://mpforestvillage.in/api/favorites?userId=${userId}`).then(res => res.json()) : Promise.resolve([]),
    enabled: !!userId,
  });
  const favorites = (favoritesResp as any)?.data ?? [];
  
  // Query recent plays
  const { data: recentPlaysResp, refetch: refetchRecent } = useQuery({
    queryKey: ['https://mpforestvillage.in/api/recent-plays', { userId }],
    queryFn: () => userId ? apiRequest('GET', `https://mpforestvillage.in/api/recent-plays?userId=${userId}`).then(res => res.json()) : Promise.resolve([]),
    enabled: !!userId,
  });
  const recentPlays = (recentPlaysResp as any)?.data ?? [];
  
  // Get category names for playlists
  const { data: categories } = useQuery({
    queryKey: ['https://mpforestvillage.in/api/categories'],
  });
  
  const categoryMap = Array.isArray(categories)
    ? new Map(categories.map((c: any) => [c.id, c.name]))
    : new Map();
  
  // Query liked affirmations
  const { data: likedAffirmationsRespRaw, refetch: refetchLikedAffirmations } = useQuery({
    queryKey: [`https://mpforestvillage.in/api/liked-affirmations?userId=${userId}`, { userId }],
    enabled: !!userId,
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to fetch liked affirmations.', variant: 'destructive' });
      console.warn('Failed to fetch liked affirmations:', error);
    },
  });
  const likedAffirmationsResp: any = likedAffirmationsRespRaw;
  const likedAffirmations = (likedAffirmationsResp as any)?.data ?? [];
  
  // Fetch full details for each liked affirmation
  const [likedAffirmationDetails, setLikedAffirmationDetails] = useState<any[]>([]);
  const [loadingAffirmations, setLoadingAffirmations] = useState(false);

  useEffect(() => {
    if (!likedAffirmations || likedAffirmations.length === 0) {
      setLikedAffirmationDetails([]);
      return;
    }
    setLoadingAffirmations(true);
    Promise.all(
      likedAffirmations.map((a: any) =>
        fetch(`https://mpforestvillage.in/api/affirmations/${a.affirmationId || a.id}`)
          .then(res => res.ok ? res.json() : null)
          .catch(() => null)
      )
    ).then(results => {
      setLikedAffirmationDetails(results.filter(Boolean));
      setLoadingAffirmations(false);
    });
  }, [likedAffirmations]);
  
  // Refetch queries when tab is selected
  useEffect(() => {
    if (activeTab === 'favorites') refetchFavorites();
    if (activeTab === 'recent') refetchRecent();
    if (activeTab === 'liked-affirmations') refetchLikedAffirmations();
  }, [activeTab]);
  
  console.log('Library userId:', userId);
  console.log('favoritesResp:', favoritesResp);
  console.log('recentPlaysResp:', recentPlaysResp);
  console.log('likedAffirmationsResp:', likedAffirmationsResp);
  
  const handlePlay = async (playlistId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userId) return;
    try {
      // Fetch the playlist
      const playlistRes = await fetch(`https://mpforestvillage.in/api/playlists/${playlistId}`);
      const playlist = await playlistRes.json();
      
      // Fetch the affirmations
      const affirmationsRes = await fetch(`https://mpforestvillage.in/api/affirmations?playlistId=${playlistId}`);
      const affirmations = await affirmationsRes.json();
      
      // Add to recent plays
      await apiRequest(
        'POST',
        'https://mpforestvillage.in/api/recent-plays',
        { userId, playlistId }
      );
      
      // Refetch recent plays
      queryClient.invalidateQueries({ queryKey: ['https://mpforestvillage.in/api/recent-plays'] });
      
      // Play the playlist
      playPlaylist(playlist, affirmations);
    } catch (error) {
      console.error('Error playing playlist:', error);
    }
  };
  
  return (
    <div className="min-h-screen bg-background text-foreground py-4">
      <h1 className="text-2xl font-semibold mb-6">Your Library</h1>
      
      <Tabs defaultValue="favorites" onValueChange={setActiveTab}>
        <TabsList className="w-full mb-6">
          <TabsTrigger value="favorites" className="flex-1">Favorites</TabsTrigger>
          <TabsTrigger value="recent" className="flex-1">Recent</TabsTrigger>
          <TabsTrigger value="liked-affirmations" className="flex-1">Liked Affirmations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="favorites">
          {favoritesResp ? (
            <div className="space-y-3">
              {favorites.map((playlist: any) => (
                <Link key={playlist.id} href={`/playlist/${playlist.id}`}>
                  <div className="bg-card text-card-foreground rounded-lg p-3 flex items-center shadow-sm cursor-pointer">
                    <div 
                      className="w-12 h-12 rounded-md flex items-center justify-center text-white flex-shrink-0"
                      style={{ backgroundColor: playlist.coverGradientStart }}
                    >
                      <Heart className="h-5 w-5 fill-white" />
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <h3 className="font-medium text-sm line-clamp-1">{playlist.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {categoryMap.get(playlist.categoryId) || 'General'}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No favorites yet</h3>
              <p className="text-muted-foreground">
                Add playlists to your favorites by tapping the heart icon
              </p>
              <Link href="/discover">
                <a className="mt-6 inline-block px-6 py-2 bg-primary text-primary-foreground rounded-full font-medium">
                  Discover Playlists
                </a>
              </Link>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="recent">
          {recentPlaysResp ? (
            <div className="space-y-3">
              {recentPlays.map((play: any) => (
                <Link key={play.playlist.id} href={`/playlist/${play.playlist.id}`}>
                  <div className="bg-card text-card-foreground rounded-lg p-3 flex items-center shadow-sm cursor-pointer">
                    <div 
                      className="w-12 h-12 rounded-md flex items-center justify-center text-white flex-shrink-0"
                      style={{ backgroundColor: play.playlist.coverGradientStart }}
                    >
                      <Headphones className="h-5 w-5" />
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <h3 className="font-medium text-sm line-clamp-1">{play.playlist.title}</h3>
                      <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                        <span>{categoryMap.get(play.playlist.categoryId) || 'General'}</span>
                        <span className="mx-1">•</span>
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(play.playedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <Clock className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No recent plays</h3>
              <p className="text-muted-foreground">
                Start listening to affirmations to see your history
              </p>
              <Link href="/">
                <a className="mt-6 inline-block px-6 py-2 bg-primary text-primary-foreground rounded-full font-medium">
                  Explore Affirmations
                </a>
              </Link>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="liked-affirmations">
          {loadingAffirmations ? (
            <div>Loading liked affirmations...</div>
          ) : likedAffirmationDetails.length > 0 ? (
            <div className="space-y-3">
              {likedAffirmationDetails.map((affirmation: any) => (
                <div key={affirmation.id} className="bg-card text-card-foreground rounded-lg p-3 flex items-center shadow-sm">
                  <div className="w-12 h-12 rounded-md flex items-center justify-center text-white flex-shrink-0 bg-primary">
                    <Heart className="h-5 w-5 fill-white" />
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <h3 className="font-medium text-sm line-clamp-1">{affirmation.text || affirmation.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {affirmation.duration ? formatDuration(affirmation.duration) : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No liked affirmations yet</h3>
              <p className="text-muted-foreground">
                Like affirmations to see them here
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
