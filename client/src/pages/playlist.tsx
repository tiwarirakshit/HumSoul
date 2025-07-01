import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import {
  Heart,
  ChevronLeft,
  Play,
  Pause,
  Music,
  ListMusic,
  Volume2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { formatDuration, formatTime } from "@/lib/audio";
import { useAudio } from "@/hooks/use-audio";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

interface Affirmation {
  id: number;
  text: string;
  audioUrl: string;
  duration: number;
  playlistId: number;
  createdAt: string;
}

interface AffirmationsResponse {
  affirmations: Affirmation[];
  total: number;
  playlistId: number;
  playlistName: string;
  playlistImage: string;
  playlistDescription: string;
  playlistDuration: number;
  length: number;
}

export default function Playlist() {
  const { id } = useParams();
  const { playPlaylist, isPlaying, togglePlay, currentTrack, setBackgroundMusic, skipToAffirmation } = useAudio();
  const [, navigate] = useLocation();
  const [isFavorited, setIsFavorited] = useState(false);
  const { backendUser, loading: authLoading } = useAuth();
  const userId = backendUser?.id || 1;

  // Wait for auth to load before rendering
  if (authLoading) {
    return <div>Loading...</div>;
  }

  // Get the playlist details
  const { data: playlist, isLoading: playlistLoading } = useQuery<any>({
    queryKey: [`/api/playlists/${id}`],
  });

  // Get the affirmations for this playlist
  const { data: affirmations, isLoading: affirmationsLoading } = useQuery<AffirmationsResponse | undefined>({
    queryKey: [`/api/affirmations?playlistId=${id}`, { playlistId: id }],
  });

  // Get all background music options
  const { data: backgroundMusics } = useQuery<any[]>({
    queryKey: ['/api/background-music'],
  });

  // Check if this playlist is favorited
  useEffect(() => {
    if (!userId || !playlist?.id) return;
    fetch(`/api/favorites/check?userId=${userId}&playlistId=${playlist.id}`)
      .then(res => res.json())
      .then(data => {
        setIsFavorited(data.isFavorited);
      });
  }, [userId, playlist?.id]);

  // Get category name
  const { data: categories } = useQuery<any[]>({
    queryKey: ['/api/categories'],
  });

  // Add state to track liked affirmations
  const { data: likedAffirmationsResp } = useQuery<any>({
    queryKey: ['/api/liked-affirmations', { userId }],
    enabled: !!userId && !authLoading,
  });
  const likedAffirmations = likedAffirmationsResp?.data ?? [];
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: async (affirmationId: number) => {
      if (!userId) return;
      await fetch('/api/liked-affirmations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, affirmation_id: affirmationId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/liked-affirmations'] });
    },
  });
  const unlikeMutation = useMutation({
    mutationFn: async (affirmationId: number) => {
      if (!userId) return;
      await fetch(`/api/liked-affirmations?userId=${userId}&affirmationId=${affirmationId}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/liked-affirmations'] });
    },
  });

  const isAffirmationLiked = (affirmationId: number) =>
    likedAffirmations.some((a: any) => a?.id === affirmationId);

  const handlePlayPlaylistFromIndex = (startIndex: number) => {
    console.log("handlePlayPlaylistFromIndex called", { startIndex });
    if (!playlist || typeof playlist.id !== 'number') {
      console.log("Missing or invalid playlist", { playlist });
      return;
    }
    if (!Array.isArray(affirmations) || affirmations.length === 0) {
      console.log("Missing or invalid affirmations", { affirmations });
      return;
    }
    if (!userId) {
      console.log("Missing or invalid userId", { userId });
      return;
    }
    // Play audio immediately (user gesture)
    playPlaylist(playlist, affirmations, startIndex);

    // Then do the API call (async, doesn't block user gesture)
    apiRequest('POST', '/api/recent-plays', { userId, playlistId: playlist.id })
      .catch(error => {
        console.error('Error logging recent play:', error);
      });
  };

  const categoryName = playlist && Array.isArray(categories)
    ? categories.find((c: any) => c?.id === (playlist as any).categoryId)?.name
    : '';

  const handleToggleFavorite = async () => {
    if (!playlist || !userId) return;

    try {
      if (isFavorited) {
        await apiRequest(
          'DELETE',
          `/api/favorites?userId=${userId}&playlistId=${playlist.id}`
        );
      } else {
        await apiRequest(
          'POST',
          '/api/favorites',
          { userId, playlistId: playlist.id }
        );
      }

      setIsFavorited(!isFavorited);
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handlePlayPlaylist = async () => {
    if (!playlist || !affirmations?.affirmations || !userId) return;

    try {
      await apiRequest('POST', '/api/recent-plays', { userId, playlistId: (playlist as any).id });
      playPlaylist(playlist as any, affirmations.affirmations);
    } catch (error) {
      console.error('Error playing playlist:', error);
    }
  };

  const handlePlayPause = async () => {
    if (!playlist || !affirmations?.affirmations || !userId) return;

    if (currentTrack?.playlist.id === Number(id)) {
      togglePlay();
      return;
    }

    try {
      await apiRequest('POST', '/api/recent-plays', { userId, playlistId: (playlist as any).id });
      playPlaylist(playlist as any, affirmations.affirmations, 0);
    } catch (error) {
      console.error('Error playing playlist:', error);
    }
  };

  const handleSelectBackgroundMusic = (musicId: string) => {
    const selectedMusic = backgroundMusics?.find((m: any) => m.id === Number(musicId));
    if (selectedMusic) {
      setBackgroundMusic(selectedMusic);
    } else {
      setBackgroundMusic(null);
    }
  };

  const isLoading = playlistLoading || affirmationsLoading;

  // Add test sound function
  const playTestSound = () => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, ctx.currentTime); // 440 Hz = A4
    oscillator.connect(ctx.destination);
    oscillator.start();
    setTimeout(() => {
      oscillator.stop();
      ctx.close();
    }, 500); // Play for 0.5 seconds
  };

  if (isLoading) {
    return (
      <div className="py-4">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Skeleton className="h-8 w-40" />
        </div>

        <Skeleton className="h-48 w-full rounded-xl mb-6" />

        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="py-4">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-semibold">Playlist Not Found</h1>
        </div>

        <div className="text-center py-10">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            The playlist you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/discover")}>
            Browse Playlists
          </Button>
        </div>
      </div>
    );
  }

  const calculateTotalDuration = (affirmationsList: any[] = []) => {
    return affirmationsList.reduce((sum: number, affirmation: any) => sum + affirmation.duration, 0);
  };

  return (
    <div className="py-4 pb-28">
      {/* Test Sound Button */}
      <div className="mb-4">
        <button onClick={playTestSound} style={{padding: '8px 16px', background: '#eee', borderRadius: 4, fontWeight: 600}}>
          🔊 Test Sound
        </button>
      </div>
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-semibold">Playlist</h1>
      </div>

      {/* Playlist Header */}
      <div
        className="rounded-xl p-6 text-white mb-6 relative overflow-hidden"
        style={{
          background: `linear-gradient(to right, ${playlist.coverGradientStart}, ${playlist.coverGradientEnd})`
        }}
      >
        <div className="relative z-10">
          <span className="bg-white bg-opacity-25 text-white text-xs px-3 py-1 rounded-full font-medium">
            {categoryName}
          </span>
          <h2 className="text-2xl font-semibold mt-3">{playlist.title}</h2>
          <p className="text-white text-opacity-90 mt-1">{playlist.description}</p>

          <div className="flex flex-wrap mt-3 text-sm text-white text-opacity-80">
            <div className="mr-4">
              <span className="font-medium">{affirmations?.length}</span> affirmations
            </div>
            <div className="mr-4">
              <span className="font-medium">{formatDuration(calculateTotalDuration(affirmations?.affirmations))}</span> total
            </div>
          </div>

          <div className="flex items-center mt-4 space-x-3">
            <Button
              variant="default"
              className={`font-medium transition-all duration-200 ${currentTrack?.playlist.id === Number(id) && isPlaying
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "bg-white text-primary hover:bg-primary hover:text-white"
                }`}
              onClick={handlePlayPause}
            >
              {currentTrack?.playlist.id === Number(id) && isPlaying ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  <span>Pause</span>
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
              onClick={handleToggleFavorite}
            >
              <Heart className={`h-5 w-5 ${isFavorited ? 'fill-white' : ''}`} />
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-white bg-opacity-25 border-none text-white hover:bg-white hover:bg-opacity-40"
                >
                  <Music className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Background Music</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Select background music to enhance your affirmation experience
                  </p>

                  <Select onValueChange={handleSelectBackgroundMusic}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose background music" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No background music</SelectItem>
                      {backgroundMusics?.map((music: any) => (
                        <SelectItem key={music.id} value={music.id.toString()}>
                          {music.name} ({music.category})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="space-y-2">
                    <div className="text-sm font-medium">Volume Mix</div>
                    <div className="flex items-center">
                      <Volume2 className="h-4 w-4 text-gray-500 mr-2" />
                      <div className="text-xs text-gray-500">
                        Adjust volume in the player controls
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/2 right-4 w-32 h-32 rounded-full bg-white opacity-10"></div>
        <div className="absolute bottom-0 right-24 w-20 h-20 rounded-full bg-white opacity-10"></div>
      </div>

      {/* Affirmations List */}
      <div className="bg-white dark:bg-dark-light rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium flex items-center">
            <ListMusic className="h-5 w-5 mr-2" />
            Affirmations
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {affirmations?.length} affirmations
          </span>
        </div>

        <Separator className="mb-4" />

        {!affirmations || affirmations.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500 dark:text-gray-400">
              No affirmations available in this playlist
            </p>
            {/* Debug fallback: show raw affirmations data */}
            <pre style={{textAlign: 'left', marginTop: 16, background: '#f8f8f8', color: '#333', padding: 8, borderRadius: 4, fontSize: 12}}>
              {JSON.stringify(affirmations, null, 2)}
            </pre>
          </div>
        ) : (
          <div className="space-y-2">
            {affirmations.map((affirmation: any, index: number) => (
              <div
                key={affirmation.id}
                onClick={() => {
                  console.log("Affirmation clicked", { index, affirmation });
                  if (!affirmation.audioUrl) {
                    alert('This affirmation does not have a valid audio file.');
                    return;
                  }
                  if (!currentTrack || currentTrack.playlist.id !== Number(id)) {
                    // Start playlist from this affirmation
                    handlePlayPlaylistFromIndex(index);
                  } else if (currentTrack.currentAffirmationIndex === index) {
                    togglePlay();
                  } else {
                    // Skip to this affirmation
                    skipToAffirmation(index);
                  }
                }}
                className={`p-3 rounded-lg flex items-center ${currentTrack?.playlist.id === Number(id) &&
                  currentTrack.currentAffirmationIndex === index
                  ? 'bg-primary/10'
                  : 'hover:bg-gray-50 dark:hover:bg-dark-lighter'
                  }`}
              >
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-dark-lighter flex items-center justify-center flex-shrink-0 mr-3">
                  {currentTrack?.playlist.id === Number(id) &&
                    currentTrack.currentAffirmationIndex === index && isPlaying ? (
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                  ) : (
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {index + 1}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm line-clamp-2">
                    {affirmation.text ?? affirmation.title}
                    {!affirmation.audioUrl && (
                      <span className="ml-2 text-xs text-red-500">(No audio)</span>
                    )}
                  </p>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatTime(affirmation.duration)}
                  </span>
                </div>
                <div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={e => {
                      e.stopPropagation();
                      if (isAffirmationLiked(affirmation.id)) {
                        unlikeMutation.mutate(affirmation.id);
                      } else {
                        likeMutation.mutate(affirmation.id);
                      }
                    }}
                    disabled={!userId}
                  >
                    <Heart className={`h-5 w-5 ${isAffirmationLiked(affirmation.id) ? 'fill-primary text-primary' : ''}`} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
