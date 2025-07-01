import { useAudio } from "@/hooks/use-audio";
import { useLocation } from "wouter";
import { Heart, ChevronLeft, Clock, PlayCircle, PauseCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AudioPlayer } from "@/components/ui/audio-player";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { formatTime } from "@/lib/audio";
import { useAuth } from "@/hooks/use-auth";

export default function AudioPage() {
  const { currentTrack, currentAffirmation, duration, isPlaying, togglePlay } = useAudio();
  const [location, setLocation] = useLocation();
  const [redirected, setRedirected] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
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

  useEffect(() => {
    console.log('audio.tsx', { currentTrack, currentAffirmation, location, redirected });
    if ((!currentTrack || !currentAffirmation) && location !== '/' && !redirected) {
      setRedirected(true);
      setLocation('/');
    }
  }, [currentTrack, currentAffirmation, setLocation, location, redirected]);

  if (!currentTrack || !currentAffirmation) {
    return null;
  }

  const toggleFavorite = async () => {
    if (!userId) return;
    try {
      if (isFavorited) {
        await apiRequest(
          'DELETE', 
          `/api/favorites?userId=${userId}&playlistId=${currentTrack.playlist.id}`
        );
      } else {
        await apiRequest(
          'POST', 
          '/api/favorites', 
          { userId, playlistId: currentTrack.playlist.id }
        );
      }
      
      setIsFavorited(!isFavorited);
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  useEffect(() => {
    if (userId && currentTrack?.playlist?.id) {
      apiRequest('POST', '/api/recent-plays', { userId, playlistId: currentTrack.playlist.id });
    }
  }, [userId, currentTrack?.playlist?.id]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border/40">

      </div>

      {/* Content */}
      <div className="pt-16 pb-24 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Track Info */}
          <div className="flex flex-col items-center text-center mb-12">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-6 shadow-lg">
              <i className={`bx bx-${currentTrack.playlist.icon} text-6xl text-primary`}></i>
            </div>
            <h2 className="text-2xl font-semibold mb-2 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              {currentTrack.playlist.title}
            </h2>
            <p className="text-muted-foreground max-w-md">
              {currentAffirmation.text}
            </p>
            <div className="flex items-center gap-2 mt-4 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Audio Player */}
          <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-6 border border-border/40 shadow-lg">
          
            <AudioPlayer showWaveform />
          </div>

          {/* Playlist Info */}
          <div className="mt-12">
            <h3 className="text-lg font-medium mb-4 text-center bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              About this meditation
            </h3>
            <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-6 border border-border/40">
              <p className="text-muted-foreground leading-relaxed">
                {currentTrack.playlist.description || 'No description available'}
              </p>
            </div>
          </div>

          {/* Affirmation Text */}
          <div className="mt-12 text-center">
            <p className="text-lg font-medium text-muted-foreground mb-2">Current Affirmation</p>
            <p className="text-2xl font-medium leading-relaxed">
              {currentAffirmation.text}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 