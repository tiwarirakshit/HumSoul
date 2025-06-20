import { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { Howl } from 'howler';

export interface Affirmation {
  id: number;
  text: string;
  audioUrl: string;
  duration: number;
  playlistId: number;
}

export interface BackgroundMusic {
  id: number;
  name: string;
  audioUrl: string;
  category: string;
}

export interface Playlist {
  id: number;
  title: string;
  description: string | null;
  duration: number;
  affirmationCount: number;
  coverGradientStart: string;
  coverGradientEnd: string;
  icon: string;
  categoryId: number;
  isFeatured: boolean;
  createdAt: Date;
}

interface AudioTrack {
  playlist: Playlist;
  affirmations: Affirmation[];
  currentAffirmationIndex: number;
}

export interface AudioContextType {
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  progress: number;
  volume: number;
  backgroundMusicVolume: number;
  currentAffirmation: Affirmation | null;
  backgroundMusic: BackgroundMusic | null;
  playPlaylist: (playlist: Playlist, affirmations: Affirmation[], startIndex?: number) => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  next: () => void;
  previous: () => void;
  setVolume: (volume: number) => void;
  setBackgroundMusicVolume: (volume: number) => void;
  setBackgroundMusic: (music: BackgroundMusic | null) => void;
  skipToAffirmation: (index: number) => void;
}

// Create the audio context with an initial undefined value that will be set by the provider
export const AudioContext = createContext<AudioContextType | null>(null);

interface AudioProviderProps {
  children: ReactNode;
}

export function AudioProvider({ children }: AudioProviderProps) {
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [backgroundMusicVolume, setBackgroundMusicVolume] = useState(0.3);
  const [backgroundMusic, setBackgroundMusic] = useState<BackgroundMusic | null>(null);

  const affirmationSoundRef = useRef<Howl | null>(null);
  const backgroundSoundRef = useRef<Howl | null>(null);
  const timerRef = useRef<number | null>(null);
  const lastLoadedAffirmationIndex = useRef<number | null>(null);

  // Get current affirmation
  const currentAffirmation = currentTrack
    ? currentTrack.affirmations[currentTrack.currentAffirmationIndex]
    : null;

  // Create a function to update the time and progress
  const updateTimeProgress = () => {
    if (affirmationSoundRef.current && isPlaying) {
      const currentSoundTime = affirmationSoundRef.current.seek() as number;
      setCurrentTime(currentSoundTime);
      if (duration > 0) {
        setProgress((currentSoundTime / duration) * 100);
      }
      timerRef.current = window.setTimeout(updateTimeProgress, 100);
    }
  };

  const skipToAffirmation = (index: number) => {
    if (!currentTrack || index < 0 || index >= currentTrack.affirmations.length) {
      return;
    }

    // Update the current affirmation index
    setCurrentTrack({
      ...currentTrack,
      currentAffirmationIndex: index
    });

    // Load the selected affirmation
    loadAffirmation(currentTrack.affirmations[index]);

    // If we were playing, continue playing the new affirmation
    if (isPlaying) {
      // The loadAffirmation function will handle starting playback
      // since isPlaying is true
    }
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Start or stop timer based on isPlaying
  useEffect(() => {
    if (isPlaying) {
      updateTimeProgress();
    } else if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, [isPlaying]);

  // Play a playlist
  const playPlaylist = (playlist: Playlist, affirmations: Affirmation[], startIndex: number = 0) => {
    // Stop any existing sounds
    if (affirmationSoundRef.current) {
      affirmationSoundRef.current.stop();
    }

    // Create a new track with the specified starting index
    const newTrack: AudioTrack = {
      playlist,
      affirmations,
      currentAffirmationIndex: startIndex
    };

    setCurrentTrack(newTrack);
    setIsPlaying(true); // Set playing state immediately
    
    // Load and play the affirmation at the specified index
    if (affirmations.length > startIndex) {
      loadAffirmation(affirmations[startIndex]);
    }
  };

  // Load an affirmation into the Howl instance
  const loadAffirmation = (affirmation: Affirmation) => {
    if (affirmationSoundRef.current) {
      affirmationSoundRef.current.stop();
      affirmationSoundRef.current.unload();
    }

    affirmationSoundRef.current = new Howl({
      src: [affirmation.audioUrl],
      html5: true,
      volume: volume,
      onend: handleAffirmationEnd,
      onload: () => {
        if (affirmationSoundRef.current) {
          const soundDuration = affirmationSoundRef.current.duration();
          setDuration(soundDuration);
          setCurrentTime(0);
          setProgress(0);
          
          // Only start playing if isPlaying is true
          if (isPlaying) {
            affirmationSoundRef.current.play();
            // Start background music if available
            if (backgroundSoundRef.current && backgroundMusic) {
              backgroundSoundRef.current.play();
            }
          }
        }
      },
      onloaderror: (id, error) => {
        console.error('Failed to load audio:', error);
        console.error('Audio URL:', affirmation.audioUrl);
      },
      onplayerror: (id, error) => {
        console.error('Failed to play audio:', error);
      }
    });

    // Load the sound
    affirmationSoundRef.current.load();
  };

  // Handle affirmation end
  const handleAffirmationEnd = () => {
    if (currentTrack) {
      // Check if there are more affirmations
      if (currentTrack.currentAffirmationIndex < currentTrack.affirmations.length - 1) {
        // Move to the next affirmation
        const nextIndex = currentTrack.currentAffirmationIndex + 1;
        setCurrentTrack({
          ...currentTrack,
          currentAffirmationIndex: nextIndex
        });

        // Load and play the next affirmation
        loadAffirmation(currentTrack.affirmations[nextIndex]);
      } else {
        // End of playlist
        setIsPlaying(false);
      }
    }
  };

  // Toggle play/pause
  const togglePlay = () => {
    if (!currentTrack || !affirmationSoundRef.current) {
      return;
    }

    console.debug("currentTrack", currentTrack);

    if (isPlaying) {
      affirmationSoundRef.current.pause();
      if (backgroundSoundRef.current) {
        backgroundSoundRef.current.pause();
      }
    } else {
      affirmationSoundRef.current.play();
      if (backgroundSoundRef.current) {
        backgroundSoundRef.current.play();
      }
    }

    setIsPlaying(!isPlaying);
  };

  // Seek to a specific time
  const seek = (time: number) => {
    if (!affirmationSoundRef.current) return;

    affirmationSoundRef.current.seek(time);
    setCurrentTime(time);
    setProgress((time / duration) * 100);

    // If not playing, start the timer for a moment to update UI
    if (!isPlaying) {
      updateTimeProgress();
    }
  };

  // Go to next affirmation
  const next = () => {
    if (!currentTrack) return;

    if (currentTrack.currentAffirmationIndex < currentTrack.affirmations.length - 1) {
      const nextIndex = currentTrack.currentAffirmationIndex + 1;
      setCurrentTrack({
        ...currentTrack,
        currentAffirmationIndex: nextIndex
      });

      loadAffirmation(currentTrack.affirmations[nextIndex]);
    }
  };

  // Go to previous affirmation
  const previous = () => {
    if (!currentTrack) return;

    // If current time is more than 3 seconds, restart current affirmation
    if (currentTime > 3) {
      seek(0);
      return;
    }

    if (currentTrack.currentAffirmationIndex > 0) {
      const prevIndex = currentTrack.currentAffirmationIndex - 1;
      setCurrentTrack({
        ...currentTrack,
        currentAffirmationIndex: prevIndex
      });

      loadAffirmation(currentTrack.affirmations[prevIndex]);
    }
  };

  // Update affirmation volume
  useEffect(() => {
    if (affirmationSoundRef.current) {
      affirmationSoundRef.current.volume(volume);
    }
  }, [volume]);

  // Set background music
  useEffect(() => {
    if (backgroundMusic) {
      if (backgroundSoundRef.current) {
        backgroundSoundRef.current.stop();
        backgroundSoundRef.current.unload();
      }

      backgroundSoundRef.current = new Howl({
        src: [backgroundMusic.audioUrl],
        html5: true,
        volume: backgroundMusicVolume,
        loop: true
      });

      if (isPlaying) {
        backgroundSoundRef.current.play();
      }
    } else if (backgroundSoundRef.current) {
      backgroundSoundRef.current.stop();
      backgroundSoundRef.current.unload();
      backgroundSoundRef.current = null;
    }
  }, [backgroundMusic]);

  // Update background music volume
  useEffect(() => {
    if (backgroundSoundRef.current) {
      backgroundSoundRef.current.volume(backgroundMusicVolume);
    }
  }, [backgroundMusicVolume]);

  // If the current affirmation index changes, load the new one
  useEffect(() => {
    if (
      currentTrack &&
      currentAffirmation &&
      currentTrack.currentAffirmationIndex !== lastLoadedAffirmationIndex.current
    ) {
      loadAffirmation(currentAffirmation);
      lastLoadedAffirmationIndex.current = currentTrack.currentAffirmationIndex;
    }
  }, [currentTrack?.currentAffirmationIndex, currentAffirmation, currentTrack]);

  const value = {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    progress,
    volume,
    backgroundMusicVolume,
    currentAffirmation,
    backgroundMusic,
    skipToAffirmation,
    playPlaylist,
    togglePlay,
    seek,
    next,
    previous,
    setVolume: (v: number) => setVolume(v),
    setBackgroundMusicVolume: (v: number) => setBackgroundMusicVolume(v),
    setBackgroundMusic: (music: BackgroundMusic | null) => setBackgroundMusic(music)
  };

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}

// This function is defined in hooks/use-audio.ts
// Keeping this function here might cause circular dependency issues
